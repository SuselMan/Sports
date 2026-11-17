import dayjs from 'dayjs';

// A diary date is a calendar day, not an instant to convert in the receiver's zone.
export function calendarDate(date: string): string {
  const value = dayjs(date);
  if (!value.isValid()) throw Error('Некорректная дата записи');
  return value.format('YYYY-MM-DD');
}

export function withCalendarDate<T extends { date: string; calendarDate?: string }>(row: T) {
  return { ...row, calendarDate: row.calendarDate || calendarDate(row.date) };
}
