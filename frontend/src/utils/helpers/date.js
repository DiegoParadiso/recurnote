import { DateTime } from 'luxon';

export function formatDateKey(dateObj) {
  return DateTime.fromObject(dateObj).toISODate();
}


