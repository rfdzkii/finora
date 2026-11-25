import type { Category, Transaction } from '../models/types';
function cell(value: string | number): string {
  let raw = String(value);
  if (/^[\s]*[=+@-]/.test(raw) || /^[\t\r]/.test(raw)) raw = `'${raw}`;
  return `"${raw.replaceAll('"', '""')}"`;
}
export function transactionsCsv(records: readonly Transaction[], categories: readonly Category[]): string {
  const rows: (string | number)[][] = [['ID', 'Title', 'Amount (IDR)', 'Type', 'Category', 'Date', 'Description', 'Created at']];
  for (const t of records) rows.push([t.id, t.title, t.amount, t.type,
    categories.find(c => c.id === t.categoryId)?.name ?? 'Unknown category', t.date, t.description, t.createdAt]);
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
