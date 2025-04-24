
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TweetData, calculateSentimentDistribution, generateTweetSummary, TweetSummaryStats, WordCloudItem } from '@/utils/csvUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentSummaryProps {
  data: TweetData[];
}

const SentimentSummary = ({ data }: SentimentSummaryProps) => {
  const [summary, setSummary] = useState<TweetSummaryStats | null>(null);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);

  // Colors for sentiment categories
  const COLORS = {
    positive: '#4ADE80', // Green
    neutral: '#94A3B8',  // Gray
    negative: '#F87171', // Red
  };

  useEffect(() => {
    if (data.length > 0) {
      // Generate summary statistics
      const summaryStats = generateTweetSummary(data);
      setSummary(summaryStats);
      
      // Prepare data for pie chart
      const chartData = Object.entries(summaryStats.sentimentCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        value
      }));
      setPieData(chartData);
    }
  }, [data]);

  // Format sentiment score
  const formatSentiment = (score: number) => {
    return score.toFixed(2);
  };

  // Render top words
  const renderTopWords = (words: WordCloudItem[]) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {words.map((word, index) => (
          <div key={index} className="flex justify-between">
            <span className="font-medium">{word.text}</span>
            <span className="text-muted-foreground">{word.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Sentiment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Tweet Statistics</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tweets</span>
                    <span className="font-medium">{summary.totalTweets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Sentiment</span>
                    <span className="font-medium">{formatSentiment(summary.averageSentiment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive Tweets</span>
                    <span className="font-medium">{summary.sentimentCounts.positive || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Neutral Tweets</span>
                    <span className="font-medium">{summary.sentimentCounts.neutral || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Negative Tweets</span>
                    <span className="font-medium">{summary.sentimentCounts.negative || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Top Words</h3>
                {renderTopWords(summary.topWords)}
              </div>
            </div>
            
            <div className="h-[300px]">
              <h3 className="text-lg font-medium mb-4">Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentSummary;
