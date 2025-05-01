import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TweetData, processForWordCloud, WordCloudItem } from '@/utils/csvUtils';
import { TagCloud } from 'react-tagcloud';

interface WordCloudVisualizationProps {
  data: TweetData[];
}

const WordCloudVisualization = ({ data }: WordCloudVisualizationProps) => {
  const [words, setWords] = useState<WordCloudItem[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      const texts = data.map(item => item.translated_text).filter(Boolean);
      const wordCloudData = processForWordCloud(texts);
      setWords(wordCloudData);
    }
  }, [data]);

  // Convert words to the format expected by react-tagcloud
  const tagCloudData = words.map(word => ({
    value: word.text,
    count: word.value,
  }));

  return (
    <Card className="w-full h-full min-h-[400px]">
      <CardHeader>
        <CardTitle>Most Frequent Words</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] flex items-center justify-center">
        {words.length > 0 ? (
          <TagCloud
            minSize={12}
            maxSize={35}
            tags={tagCloudData}
            className="w-full h-full"
            colorOptions={{
              luminosity: 'dark',
              hue: 'blue'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordCloudVisualization;
