
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TweetData, getDateRange } from '@/utils/csvUtils';

interface DateRangePickerProps {
  data: TweetData[];
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker = ({ data, onDateRangeChange }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      // Set initial date range from data
      const { minDate, maxDate } = getDateRange(data);
      setStartDate(minDate);
      setEndDate(maxDate);
      onDateRangeChange(minDate, maxDate);
    }
  }, [data, onDateRangeChange]);

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setIsStartOpen(false);
    
    if (date && endDate) {
      // If selected start date is after end date, adjust end date
      const newEndDate = date > endDate ? date : endDate;
      setEndDate(newEndDate);
      onDateRangeChange(date, newEndDate);
    } else if (date && !endDate && data.length > 0) {
      // If no end date is set, use max date from data
      const { maxDate } = getDateRange(data);
      setEndDate(maxDate);
      onDateRangeChange(date, maxDate);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setIsEndOpen(false);
    
    if (date && startDate) {
      // If selected end date is before start date, adjust start date
      const newStartDate = date < startDate ? date : startDate;
      setStartDate(newStartDate);
      onDateRangeChange(newStartDate, date);
    } else if (date && !startDate && data.length > 0) {
      // If no start date is set, use min date from data
      const { minDate } = getDateRange(data);
      setStartDate(minDate);
      onDateRangeChange(minDate, date);
    }
  };

  // Only enable dates within the dataset range
  const disableDate = (date: Date) => {
    if (data.length === 0) return false;
    
    const { minDate, maxDate } = getDateRange(data);
    return date < minDate || date > maxDate;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Start Date</span>
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? format(startDate, 'PP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateSelect}
              disabled={disableDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">End Date</span>
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              {endDate ? format(endDate, 'PP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateSelect}
              disabled={disableDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangePicker;
