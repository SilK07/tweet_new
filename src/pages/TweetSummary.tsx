import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TweetData, generateTweetSummary } from '@/utils/csvUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TweetSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data as TweetData[] || [];
  const dateRange = location.state?.dateRange || { startDate: null, endDate: null };

  // Function to analyze main topics from tweets
  const analyzeTopics = (tweets: TweetData[]) => {
    const allText = tweets.map(tweet => tweet.translated_text.toLowerCase()).join(' ');
    
    // Common words to exclude from topic analysis
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were'];
    
    // Split into words and count frequencies
    const words = allText.split(/\s+/)
      .filter(word => word.length > 3) // Filter out short words
      .filter(word => !commonWords.includes(word)) // Filter out common words
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    // Sort by frequency and get top 5
    return Object.entries(words)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  };

  // Function to group tweets by sentiment
  const groupBySentiment = (data: TweetData[]) => {
    return data.reduce((groups, tweet) => {
      const sentiment = tweet.sentiment?.toLowerCase() || 'unknown';
      if (!groups[sentiment]) {
        groups[sentiment] = [];
      }
      groups[sentiment].push(tweet);
      return groups;
    }, {} as Record<string, TweetData[]>);
  };

  const tweetGroups = groupBySentiment(data);
  const summary = generateTweetSummary(data);
  const topTopics = analyzeTopics(data);

  // Function to format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tweet Summary</h1>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>

      {/* New Topic Analysis Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Hot Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topTopics.map((topic, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg">
                    <p className="font-medium capitalize">{topic.word}</p>
                    <p className="text-sm text-muted-foreground">
                      Mentioned {topic.count} times
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    Positive Tweets
                  </p>
                  <p className="text-2xl font-bold">{tweetGroups.positive?.length || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-400 font-medium">
                    Neutral Tweets
                  </p>
                  <p className="text-2xl font-bold">{tweetGroups.neutral?.length || 0}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 font-medium">
                    Negative Tweets
                  </p>
                  <p className="text-2xl font-bold">{tweetGroups.negative?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Total Tweets</p>
              <p className="text-2xl font-bold">{summary.totalTweets}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Average Sentiment</p>
              <p className="text-2xl font-bold">{summary.averageSentiment.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-sm font-medium">
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Top Words</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {summary.topWords.map((word, index) => (
                <div key={index} className="bg-muted p-2 rounded-md text-center">
                  <p className="font-medium">{word.text}</p>
                  <p className="text-sm text-muted-foreground">({word.value})</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positive Tweets */}
      {tweetGroups.positive && tweetGroups.positive.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-green-700 dark:text-green-400">
              Positive Tweets ({tweetGroups.positive.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {tweetGroups.positive.map((tweet, index) => (
              <div key={index} className="py-3">
                <p className="text-sm text-muted-foreground mb-1">
                  {tweet.date} {tweet.time}
                </p>
                <p>{tweet.translated_text}</p>
                <p className="text-sm text-green-600 mt-1">
                  Sentiment Score: {tweet.compound.toFixed(2)}
                </p>
                {index < tweetGroups.positive.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Neutral Tweets */}
      {tweetGroups.neutral && tweetGroups.neutral.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="bg-slate-50 dark:bg-slate-950/20">
            <CardTitle className="text-slate-700 dark:text-slate-400">
              Neutral Tweets ({tweetGroups.neutral.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {tweetGroups.neutral.map((tweet, index) => (
              <div key={index} className="py-3">
                <p className="text-sm text-muted-foreground mb-1">
                  {tweet.date} {tweet.time}
                </p>
                <p>{tweet.translated_text}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Sentiment Score: {tweet.compound.toFixed(2)}
                </p>
                {index < tweetGroups.neutral.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Negative Tweets */}
      {tweetGroups.negative && tweetGroups.negative.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-red-700 dark:text-red-400">
              Negative Tweets ({tweetGroups.negative.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {tweetGroups.negative.map((tweet, index) => (
              <div key={index} className="py-3">
                <p className="text-sm text-muted-foreground mb-1">
                  {tweet.date} {tweet.time}
                </p>
                <p>{tweet.translated_text}</p>
                <p className="text-sm text-red-600 mt-1">
                  Sentiment Score: {tweet.compound.toFixed(2)}
                </p>
                {index < tweetGroups.negative.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TweetSummary;
