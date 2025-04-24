
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV, TweetData } from '@/utils/csvUtils';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (data: TweetData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload = ({ onDataLoaded, isLoading, setIsLoading }: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await parseCSV(file);
      
      if (data.length === 0) {
        setError('The CSV file is empty or has invalid format.');
        setIsLoading(false);
        return;
      }
      
      // Validate required columns
      const requiredColumns = ['date', 'time', 'translated_text', 'compound', 'sentiment'];
      const missingColumns = requiredColumns.filter(
        col => !Object.keys(data[0]).includes(col)
      );
      
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`);
        setIsLoading(false);
        return;
      }
      
      onDataLoaded(data);
    } catch (err) {
      console.error(err);
      setError('Failed to parse CSV file. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg border-2 border-primary/10">
      <CardContent className="pt-10 pb-8">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">TweetVerse Analyzer</h2>
            <p className="text-muted-foreground text-center max-w-md mx-auto">
              Upload a CSV file with tweets data to visualize sentiment analysis and generate word clouds
            </p>
          </div>
          
          <div className="flex flex-col gap-5 items-center">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={isLoading}
              className="w-full cursor-pointer"
              id="csv-upload"
            />
            
            <div className="rounded-md bg-secondary p-3 w-full">
              <h3 className="font-medium mb-1 text-sm">Required CSV columns:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">date</span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">time</span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">tweet</span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">translated_text</span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">compound</span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">sentiment</span>
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
            <div className="flex justify-center my-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
