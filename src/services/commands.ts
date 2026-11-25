import type { AppData, TransactionInput } from '../models/types';
import { validateData, validateTransaction, requireText } from './validation';
export function saveTransaction(data: AppData, input: TransactionInput, existingId?: string): AppData {
  const validated = validateTransaction(input, data.categories);
  if (existingId && !data.transactions.some(t => t.id === existingId)) throw new Error('Transaction no longer exists.');
  const transactions = existingId
    ? data.transactions.map(t => t.id === existingId ? { ...t, ...validated } : t)
    : [...data.transactions, { ...validated, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
  return validateData({ ...data, transactions });
}
export function deleteTransaction(data: AppData, id: string): AppData {
  if (!data.transactions.some(t => t.id === id)) throw new Error('Transaction no longer exists.');
  return validateData({ ...data, transactions: data.transactions.filter(t => t.id !== id) });
}
export function saveCategory(data: AppData, name: string, type: 'income' | 'expense', id?: string): AppData {
  const category = { id: id ?? crypto.randomUUID(), name: requireText(name, 'Category name', 60), type, predefined: false };
  if (id) {
    const old = data.categories.find(c => c.id === id);
    if (!old || old.predefined) throw new Error('Only custom categories can be edited.');
    if (old.type !== type) throw new Error('Category type cannot be changed.');
  }
  return validateData({ ...data, categories: id ? data.categories.map(c => c.id === id ? category : c) : [...data.categories, category] });
}
export function deleteCategory(data: AppData, id: string, replacementId?: string): AppData {
  const category = data.categories.find(c => c.id === id);
  if (!category || category.predefined) throw new Error('Only custom categories can be deleted.');
  const used = data.transactions.some(t => t.categoryId === id) || data.budgets.some(b => b.categoryId === id);
  if (used && !replacementId) throw new Error('Reassign transactions and budgets before deleting this category.');
  if (replacementId && !data.categories.some(c => c.id === replacementId && c.id !== id && c.type === category.type)) throw new Error('Invalid replacement category.');
  return validateData({ ...data, categories: data.categories.filter(c => c.id !== id),
    transactions: data.transactions.map(t => t.categoryId === id ? { ...t, categoryId: replacementId! } : t),
    budgets: data.budgets.map(b => b.categoryId === id ? { ...b, categoryId: replacementId! } : b) });
}
