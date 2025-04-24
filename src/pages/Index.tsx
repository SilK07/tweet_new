
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TweetData, filterByDateRange } from '@/utils/csvUtils';
import FileUpload from '@/components/FileUpload';
import DateRangePicker from '@/components/DateRangePicker';
import WordCloudVisualization from '@/components/WordCloudVisualization';
import SentimentLineChart from '@/components/SentimentLineChart';
import SentimentSummary from '@/components/SentimentSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState<TweetData[]>([]);
  const [filteredData, setFilteredData] = useState<TweetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleDataLoaded = (data: TweetData[]) => {
    setRawData(data);
    setFilteredData(data);
    setDataLoaded(true);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    
    // Apply date filter to the data
    const filtered = filterByDateRange(rawData, start, end);
    setFilteredData(filtered);
  };

  const viewTweetSummary = () => {
    navigate('/tweet-summary', { 
      state: { 
        data: filteredData,
        dateRange: { startDate, endDate }
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">TweetVerse Visualizer</h1>

        {!dataLoaded ? (
          <div className="max-w-3xl mx-auto">
            <FileUpload 
              onDataLoaded={handleDataLoaded} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Filter by Date</h2>
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredData.length} of {rawData.length} tweets
                    </p>
                  </div>
                  <DateRangePicker data={rawData} onDateRangeChange={handleDateRangeChange} />
                </div>
              </CardContent>
            </Card>

            {/* View Tweet Summary Button */}
            <div className="flex justify-end">
              <Button onClick={viewTweetSummary} size="lg">
                View Tweet Summary
              </Button>
            </div>

            {/* Visualizations */}
            <Tabs defaultValue="wordcloud" className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/70 rounded-lg">
                <TabsTrigger value="wordcloud" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Word Cloud
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Sentiment Chart
                </TabsTrigger>
                <TabsTrigger value="summary" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Summary
                </TabsTrigger>
              </TabsList>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <TabsContent value="wordcloud" className="mt-4 animate-scale-in">
                    <WordCloudVisualization data={filteredData} />
                  </TabsContent>
                  <TabsContent value="sentiment" className="mt-4 animate-scale-in">
                    <SentimentLineChart data={filteredData} />
                  </TabsContent>
                  <TabsContent value="summary" className="mt-4 animate-scale-in">
                    <SentimentSummary data={filteredData} />
                  </TabsContent>
                </>
              )}
            </Tabs>

            {/* Upload New File Option */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-2">
                Want to analyze a different dataset?
              </p>
              <Button 
                variant="outline" 
                onClick={() => setDataLoaded(false)}
              >
                Upload New File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
