
import Papa from 'papaparse';
import { removeStopwords, eng } from 'stopword';

export interface TweetData {
  date: string;
  time: string;
  tweet: string;
  translated_text: string;
  compound: number;
  sentiment: string;
  timestamp?: Date; // Combined date and time for easier filtering
}

// Parse CSV file and return TweetData array
export const parseCSV = (file: File): Promise<TweetData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const data = results.data as TweetData[];
          
          // Process data to add timestamp and validate required fields
          const processedData = data
            .filter(row => row.date && row.time && row.translated_text)
            .map(row => {
              // Convert string compound to number
              const compound = typeof row.compound === 'string' ? parseFloat(row.compound) : row.compound;
              
              // Create a timestamp by combining date and time
              const [day, month, year] = row.date.split('/');
              const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              const timestamp = new Date(`${dateStr}T${row.time}`);
              
              return {
                ...row,
                compound,
                timestamp
              };
            });
            
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Get the date range from the dataset
export const getDateRange = (data: TweetData[]): { minDate: Date; maxDate: Date } => {
  const timestamps = data.map(item => item.timestamp).filter(Boolean) as Date[];
  
  if (timestamps.length === 0) {
    // Default to current date range if no valid dates
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return { minDate: weekAgo, maxDate: today };
  }
  
  return {
    minDate: new Date(Math.min(...timestamps.map(d => d.getTime()))),
    maxDate: new Date(Math.max(...timestamps.map(d => d.getTime())))
  };
};

// Filter data by date range
export const filterByDateRange = (data: TweetData[], startDate: Date, endDate: Date): TweetData[] => {
  return data.filter(item => {
    if (!item.timestamp) return false;
    return item.timestamp >= startDate && item.timestamp <= endDate;
  });
};

// Process text for word cloud
export interface WordCloudItem {
  text: string;
  value: number;
}

export const processForWordCloud = (texts: string[]): WordCloudItem[] => {
  // Combine all texts and split by space
  const words = texts.join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/);
  
  // Remove stopwords
  const filteredWords = removeStopwords(words, eng);
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  filteredWords.forEach(word => {
    if (word.length > 2) { // Only include words longer than 2 characters
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Convert to format needed for word cloud
  const wordCloudData = Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100); // Limit to top 100 words
  
  return wordCloudData;
};

// Calculate sentiment distribution
export const calculateSentimentDistribution = (data: TweetData[]): { [key: string]: number } => {
  const distribution: { [key: string]: number } = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  data.forEach(item => {
    if (item.sentiment) {
      const sentiment = item.sentiment.toLowerCase();
      if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
        distribution[sentiment]++;
      }
    }
  });
  
  return distribution;
};

// Calculate sentiment over time
export interface SentimentTimeSeriesItem {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export const calculateSentimentTimeSeries = (data: TweetData[]): SentimentTimeSeriesItem[] => {
  // Group by date
  const byDate: Record<string, TweetData[]> = {};
  
  data.forEach(item => {
    if (!item.timestamp) return;
    
    const dateStr = item.timestamp.toISOString().split('T')[0];
    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }
    byDate[dateStr].push(item);
  });
  
  // Calculate sentiment counts for each date
  const timeSeries = Object.entries(byDate).map(([date, tweets]) => {
    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    
    tweets.forEach(tweet => {
      if (tweet.sentiment) {
        const sentiment = tweet.sentiment.toLowerCase();
        if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
          sentiments[sentiment as keyof typeof sentiments]++;
        }
      }
    });
    
    return {
      date,
      ...sentiments
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
  
  return timeSeries;
};

// Generate tweet summary statistics
export interface TweetSummaryStats {
  totalTweets: number;
  averageSentiment: number;
  sentimentCounts: { [key: string]: number };
  topWords: WordCloudItem[];
}

export const generateTweetSummary = (data: TweetData[]): TweetSummaryStats => {
  const totalTweets = data.length;
  
  // Calculate average compound score
  const totalCompound = data.reduce((sum, item) => sum + (item.compound || 0), 0);
  const averageSentiment = totalTweets > 0 ? totalCompound / totalTweets : 0;
  
  // Count sentiments
  const sentimentCounts = calculateSentimentDistribution(data);
  
  // Get top words
  const texts = data.map(item => item.translated_text).filter(Boolean);
  const topWords = processForWordCloud(texts).slice(0, 10);
  
  return {
    totalTweets,
    averageSentiment,
    sentimentCounts,
    topWords
  };
};
