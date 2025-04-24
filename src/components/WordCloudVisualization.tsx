
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TweetData, processForWordCloud, WordCloudItem } from '@/utils/csvUtils';
import ReactWordcloud from 'react-wordcloud';

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

  // Customize word cloud options
  const options = {
    colors: ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'impact',
    fontSizes: [12, 60] as [number, number], // Type as MinMaxPair
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90] as [number, number],
    scale: 'linear' as const, // Explicitly type as a valid scale value
    spiral: 'archimedean' as const, // Explicitly type as a valid spiral value
    transitionDuration: 1000,
  };

  return (
    <Card className="w-full h-full min-h-[400px]">
      <CardHeader>
        <CardTitle>Most Frequent Words</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {words.length > 0 ? (
          <ReactWordcloud words={words} options={options} />
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
