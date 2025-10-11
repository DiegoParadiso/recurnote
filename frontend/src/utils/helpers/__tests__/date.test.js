import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { formatDateKey, getDaysInMonth } from '../date';

describe('formatDateKey', () => {
  it('should format date object to ISO format (YYYY-MM-DD)', () => {
    const dateObj = { year: 2025, month: 10, day: 11 };
    const result = formatDateKey(dateObj);
    expect(result).toBe('2025-10-11');
  });

  it('should handle single digit months and days correctly', () => {
    const dateObj = { year: 2025, month: 1, day: 5 };
    const result = formatDateKey(dateObj);
    expect(result).toBe('2025-01-05');
  });

  it('should handle last day of year', () => {
    const dateObj = { year: 2025, month: 12, day: 31 };
    const result = formatDateKey(dateObj);
    expect(result).toBe('2025-12-31');
  });

  it('should handle first day of year', () => {
    const dateObj = { year: 2025, month: 1, day: 1 };
    const result = formatDateKey(dateObj);
    expect(result).toBe('2025-01-01');
  });
});

describe('getDaysInMonth', () => {
  it('should return all 31 days for January', () => {
    const date = DateTime.fromObject({ year: 2025, month: 1, day: 15 });
    const days = getDaysInMonth(date);

    expect(days).toHaveLength(31);
    expect(days[0]).toEqual({ day: 1, month: 1, year: 2025 });
    expect(days[30]).toEqual({ day: 31, month: 1, year: 2025 });
  });

  it('should return 28 days for February in non-leap year', () => {
    const date = DateTime.fromObject({ year: 2025, month: 2, day: 15 });
    const days = getDaysInMonth(date);

    expect(days).toHaveLength(28);
    expect(days[0]).toEqual({ day: 1, month: 2, year: 2025 });
    expect(days[27]).toEqual({ day: 28, month: 2, year: 2025 });
  });

  it('should return 29 days for February in leap year', () => {
    const date = DateTime.fromObject({ year: 2024, month: 2, day: 15 });
    const days = getDaysInMonth(date);

    expect(days).toHaveLength(29);
    expect(days[0]).toEqual({ day: 1, month: 2, year: 2024 });
    expect(days[28]).toEqual({ day: 29, month: 2, year: 2024 });
  });

  it('should return 30 days for April', () => {
    const date = DateTime.fromObject({ year: 2025, month: 4, day: 15 });
    const days = getDaysInMonth(date);

    expect(days).toHaveLength(30);
    expect(days[0]).toEqual({ day: 1, month: 4, year: 2025 });
    expect(days[29]).toEqual({ day: 30, month: 4, year: 2025 });
  });

  it('should handle December correctly', () => {
    const date = DateTime.fromObject({ year: 2025, month: 12, day: 25 });
    const days = getDaysInMonth(date);

    expect(days).toHaveLength(31);
    expect(days[0]).toEqual({ day: 1, month: 12, year: 2025 });
    expect(days[30]).toEqual({ day: 31, month: 12, year: 2025 });
  });

  it('should work regardless of the day provided in the date', () => {
    const firstDay = DateTime.fromObject({ year: 2025, month: 5, day: 1 });
    const lastDay = DateTime.fromObject({ year: 2025, month: 5, day: 31 });

    const daysFromFirst = getDaysInMonth(firstDay);
    const daysFromLast = getDaysInMonth(lastDay);

    expect(daysFromFirst).toEqual(daysFromLast);
    expect(daysFromFirst).toHaveLength(31);
  });
});
