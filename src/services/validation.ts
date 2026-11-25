import { defaultCategories } from '../models/defaults';
import type { AppData, Category, TransactionInput } from '../models/types';
import { isDate, isMonth } from '../utils/dates';
import { balance, integerMoney } from '../utils/finance';
export function requireText(value: unknown, label: string, max = 120): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
function text(value: unknown, label: string, max = 2000): string {
  if (typeof value !== 'string' || value.length > max) throw new Error(`${label} must be text (maximum ${max} characters).`);
  return value;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a record.');
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > 100000) throw new Error('Invalid or oversized collection.');
  return value;
}
function amount(value: unknown, positive = false): number {
  if (typeof value !== 'number') throw new Error('Amount must be a number.');
  return integerMoney(value, positive);
}
function type(value: unknown): 'income' | 'expense' {
  if (value !== 'income' && value !== 'expense') throw new Error('Invalid transaction type.');
  return value;
}
function date(value: unknown): string { if (!isDate(value)) throw new Error('Invalid calendar date.'); return value; }
function unique(ids: string[]) { if (new Set(ids).size !== ids.length) throw new Error('Duplicate record IDs.'); }
export function validateTransaction(value: unknown, categories: readonly Category[]): TransactionInput {
  const t = object(value);
  const categoryId = requireText(t.categoryId, 'Category ID');
  const transactionType = type(t.type);
  if (!categories.some(c => c.id === categoryId && c.type === transactionType)) throw new Error('Choose a category matching the transaction type.');
  return { title: requireText(t.title, 'Title'), amount: amount(t.amount, true), type: transactionType,
    categoryId, date: date(t.date), description: text(t.description, 'Description') };
}
export function validateData(value: unknown): AppData {
  const v = object(value);
  if (v.schemaVersion !== 1) throw new Error('Unsupported backup version.');
  const revision = amount(v.revision);
  const categories: Category[] = list(v.categories).map(raw => {
    const c = object(raw);
    if (typeof c.predefined !== 'boolean') throw new Error('Invalid category flag.');
    return { id: requireText(c.id, 'Category ID'), name: requireText(c.name, 'Category name', 60), type: type(c.type), predefined: c.predefined };
  });
  unique(categories.map(c => c.id));
  unique(categories.map(c => `${c.type}:${c.name.toLowerCase()}`));
  for (const base of defaultCategories) {
    const match = categories.find(c => c.id === base.id);
    if (!match || !match.predefined || match.type !== base.type || match.name !== base.name) throw new Error('Predefined category integrity check failed.');
  }
  if (categories.some(c => c.predefined && !defaultCategories.some(b => b.id === c.id))) throw new Error('Unknown predefined category.');
  const transactions = list(v.transactions).map(raw => {
    const t = object(raw);
    const createdAt = requireText(t.createdAt, 'Creation timestamp');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(createdAt) || !Number.isFinite(Date.parse(createdAt)) || new Date(createdAt).toISOString() !== createdAt) throw new Error('Invalid timestamp.');
    return { ...validateTransaction(t, categories), id: requireText(t.id, 'Transaction ID'), createdAt };
  });
  unique(transactions.map(t => t.id));
  const budgets = list(v.budgets).map(raw => {
    const b = object(raw);
    if (!isMonth(b.month)) throw new Error('Invalid budget month.');
    const categoryId = b.categoryId === null ? null : requireText(b.categoryId, 'Category ID');
    if (categoryId !== null && !categories.some(c => c.id === categoryId && c.type === 'expense')) throw new Error('Budget category must be an expense category.');
    return { id: requireText(b.id, 'Budget ID'), month: b.month, categoryId, amount: amount(b.amount, true) };
  });
  unique(budgets.map(b => b.id)); unique(budgets.map(b => `${b.month}:${b.categoryId ?? '*'}`));
  const goals = list(v.goals).map(raw => {
    const g = object(raw);
    return { id: requireText(g.id, 'Goal ID'), name: requireText(g.name, 'Goal name'), targetAmount: amount(g.targetAmount, true),
      savedAmount: amount(g.savedAmount), targetDate: date(g.targetDate), description: text(g.description, 'Goal description') };
  });
  unique(goals.map(g => g.id));
  const s = object(v.settings);
  if (s.currency !== 'IDR' || !['symbol', 'code'].includes(String(s.currencyDisplay)) || !['dark', 'light', 'system'].includes(String(s.theme))) throw new Error('Invalid settings.');
  const data: AppData = { schemaVersion: 1, revision, categories, transactions, budgets, goals,
    settings: { profileName: text(s.profileName, 'Profile name', 80), initialBalance: amount(s.initialBalance), currency: 'IDR',
      currencyDisplay: s.currencyDisplay as 'symbol' | 'code', theme: s.theme as 'dark' | 'light' | 'system' } };
  balance(transactions, data.settings.initialBalance);
  return data;
}
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export function parseBackup(raw: string): AppData {
  if (new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 10 MB.');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Backup is not valid JSON.'); }
  return validateData(parsed);
}
