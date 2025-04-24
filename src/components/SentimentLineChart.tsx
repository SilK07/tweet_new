
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TweetData, calculateSentimentTimeSeries, SentimentTimeSeriesItem } from '@/utils/csvUtils';

interface SentimentLineChartProps {
  data: TweetData[];
}

const SentimentLineChart = ({ data }: SentimentLineChartProps) => {
  const [chartData, setChartData] = useState<SentimentTimeSeriesItem[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      const timeSeries = calculateSentimentTimeSeries(data);
      setChartData(timeSeries);
    }
  }, [data]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <Card className="w-full h-full min-h-[400px]">
      <CardHeader>
        <CardTitle>Sentiment Distribution Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                minTickGap={30}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => {
                  return `Date: ${new Date(label).toLocaleDateString()}`;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke="#4ADE80" 
                name="Positive"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke="#94A3B8"
                name="Neutral" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke="#F87171" 
                name="Negative"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentLineChart;
