import { DateTime } from 'luxon';

export default function getDaysInMonth(date) {
  const startOfMonth = date.startOf('month');
  const daysInMonth = date.daysInMonth;
  const daysArray = [];

  for (let i = 0; i < daysInMonth; i++) {
    const day = startOfMonth.plus({ days: i });
    daysArray.push({
      day: day.day,
      month: day.month,
      year: day.year,
    });
  }

  return daysArray;
}
