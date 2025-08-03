import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export function useCircleSmallDates(selectedDay, onDayClick) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(DateTime.local());

  useEffect(() => {
    if (selectedDay) {
      const newSelected = DateTime.fromObject(selectedDay);
      if (!selectedDate || !selectedDate.hasSame(newSelected, 'day')) {
        setSelectedDate(newSelected);
        setCurrentDate(newSelected.startOf('month'));
      }
    }
  }, [selectedDay]);

  useEffect(() => {
    if (selectedDate && !selectedDate.hasSame(currentDate, 'month')) {
      setSelectedDate(null);
      onDayClick(null);
    }
  }, [currentDate]);

  return { selectedDate, setSelectedDate, currentDate, setCurrentDate };
}
