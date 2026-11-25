import type { AppData, Category, TransactionType } from './types';
const groups: [TransactionType, string[]][] = [
  ['income', ['Salary', 'Allowance', 'Business', 'Freelance', 'Investment', 'Other Income']],
  ['expense', ['Food', 'Transportation', 'Education', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other Expenses']],
];
export const defaultCategories: Category[] = groups.flatMap(([type, names]) => names.map((name) => ({
  id: `${type}-${name.toLowerCase().replaceAll(' ', '-')}`, name, type, predefined: true,
})));
export function emptyData(): AppData {
  return { schemaVersion: 1, revision: 0, categories: defaultCategories.map(c => ({ ...c })),
    transactions: [], budgets: [], goals: [],
    settings: { profileName: '', initialBalance: 0, currency: 'IDR', currencyDisplay: 'symbol', theme: 'dark' } };
}
