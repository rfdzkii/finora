import type { DateRange, Transaction } from '../models/types';
export function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 1900 || y > 9999 || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function isMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value) && isDate(`${value}-01`);
}
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function monthRange(month: string): Required<DateRange> {
  if (!isMonth(month)) throw new Error('Select a valid month.');
  const [y, m] = month.split('-').map(Number);
  return { from: `${month}-01`, to: `${month}-${new Date(Date.UTC(y, m, 0)).getUTCDate()}` };
}
export function filterDates(records: readonly Transaction[], range: DateRange): Transaction[] {
  if ((range.from && !isDate(range.from)) || (range.to && !isDate(range.to))) throw new Error('Invalid date range.');
  if (range.from && range.to && range.from > range.to) throw new Error('Start date must precede end date.');
  return records.filter(t => (!range.from || t.date >= range.from) && (!range.to || t.date <= range.to));
}
