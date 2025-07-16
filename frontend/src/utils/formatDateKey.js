import { DateTime } from 'luxon';

export default function formatDateKey(dateObj) {
  return DateTime.fromObject(dateObj).toISODate(); // Ej: "2025-07-16"
}
