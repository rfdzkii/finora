export type TransactionType = 'income' | 'expense';
export interface Category { id: string; name: string; type: TransactionType; predefined: boolean }
export interface Transaction {
  id: string; title: string; amount: number; type: TransactionType;
  categoryId: string; date: string; description: string; createdAt: string;
}
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
export interface Budget { id: string; month: string; categoryId: string | null; amount: number }
export interface SavingsGoal {
  id: string; name: string; targetAmount: number; savedAmount: number;
  targetDate: string; description: string;
}
export interface Settings {
  profileName: string; initialBalance: number; currency: 'IDR';
  currencyDisplay: 'symbol' | 'code'; theme: 'dark' | 'light' | 'system';
}
export interface AppData {
  schemaVersion: 1; revision: number; categories: Category[]; transactions: Transaction[];
  budgets: Budget[]; goals: SavingsGoal[]; settings: Settings;
}
export interface DateRange { from?: string; to?: string }
export interface DataRepository {
  load(): AppData;
  save(data: AppData, expectedRevision: number): AppData;
}
