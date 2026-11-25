import type { Budget, Category, SavingsGoal, Transaction } from '../models/types';
import { filterDates, monthRange } from './dates';
export function integerMoney(value: number, positive = false): number {
  if (!Number.isSafeInteger(value) || (positive ? value <= 0 : value < 0))
    throw new Error(positive ? 'Amount must be a positive whole rupiah value.' : 'Amount must be a non-negative whole rupiah value.');
  return value;
}
export function addMoney(a: number, b: number): number {
  const value = a + b;
  if (!Number.isSafeInteger(value)) throw new Error('Financial total exceeds the supported integer range.');
  return value;
}
export function income(records: readonly Transaction[]): number {
  return records.filter(t => t.type === 'income').reduce((n, t) => addMoney(n, integerMoney(t.amount, true)), 0);
}
export function expenses(records: readonly Transaction[]): number {
  return records.filter(t => t.type === 'expense').reduce((n, t) => addMoney(n, integerMoney(t.amount, true)), 0);
}
export function balance(records: readonly Transaction[], initialBalance = 0): number {
  integerMoney(initialBalance);
  return addMoney(addMoney(initialBalance, income(records)), -expenses(records));
}
export function netSavings(records: readonly Transaction[]): number { return addMoney(income(records), -expenses(records)); }
export function percentage(current: number, target: number): number {
  integerMoney(current); integerMoney(target, true);
  return current / target * 100;
}
export function budgetUsage(budget: Budget, records: readonly Transaction[]) {
  const month = filterDates(records, monthRange(budget.month));
  const spent = expenses(month.filter(t => budget.categoryId === null || t.categoryId === budget.categoryId));
  const percent = percentage(spent, budget.amount);
  return { spent, remaining: budget.amount - spent, percent,
    status: percent >= 100 ? 'exceeded' as const : percent >= 80 ? 'warning' as const : 'healthy' as const };
}
export function goalProgress(goal: SavingsGoal) {
  const percent = percentage(goal.savedAmount, goal.targetAmount);
  return { percent, remaining: Math.max(0, goal.targetAmount - goal.savedAmount), complete: percent >= 100 };
}
export function categoryBreakdown(records: readonly Transaction[], categories: readonly Category[]) {
  const total = expenses(records);
  return categories.filter(c => c.type === 'expense').map(c => {
    const amount = expenses(records.filter(t => t.categoryId === c.id));
    return { id: c.id, name: c.name, amount, percent: total === 0 ? 0 : amount / total * 100 };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
}
