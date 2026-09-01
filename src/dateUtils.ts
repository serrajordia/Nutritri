import { Weekday } from './types';

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/**
 * Resolves the calendar date, within the current week (Mon-Sun), that
 * corresponds to the given weekday. Mirrors the pattern of workout-log
 * apps where a weekday button always refers to "this week's" occurrence,
 * whether it is today, already past, or still to come.
 */
export function dateForWeekdayThisWeek(weekday: Weekday, reference: Date = new Date()): Date {
  const ref = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const refDay = ref.getDay() as Weekday;
  const diff = weekday - refDay;
  const result = new Date(ref);
  result.setDate(ref.getDate() + diff);
  return result;
}

export function formatDatePtBr(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey();
}
