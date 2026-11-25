import { test } from 'vitest';
import assert from 'node:assert/strict';
import { emptyData } from '../src/models/defaults';
import type { Transaction } from '../src/models/types';
import { balance, income, expenses, netSavings, budgetUsage, goalProgress, categoryBreakdown } from '../src/utils/finance';
import { filterDates, isDate, monthRange } from '../src/utils/dates';
import { transactionsCsv } from '../src/utils/csv';
import { parseRupiah } from '../src/utils/format';
import { parseBackup, validateData, validateTransaction } from '../src/services/validation';
import { MemoryRepository, LocalStorageRepository, STORAGE_KEY } from '../src/services/repository';
import { saveTransaction, deleteTransaction, saveCategory, deleteCategory } from '../src/services/commands';
const data = emptyData();
function tx(overrides: Partial<Transaction> = {}): Transaction {
  return { id: 't1', title: 'Allowance', amount: 1000000, type: 'income', categoryId: 'income-allowance', date: '2026-11-01', description: '', createdAt: '2026-11-01T00:00:00.000Z', ...overrides };
}
const records = [tx(), tx({ id: 't2', type: 'expense', amount: 250000, categoryId: 'expense-food', date: '2026-11-20' }), tx({ id: 't3', type: 'expense', amount: 100000, categoryId: 'expense-education', date: '2026-10-31' })];
test('balance includes initial balance and all transactions', () => assert.equal(balance(records, 50000), 700000));
test('income calculation', () => assert.equal(income(records), 1000000));
test('expense calculation', () => assert.equal(expenses(records), 350000));
test('net savings calculation', () => assert.equal(netSavings(records), 650000));
test('empty dataset calculations', () => { assert.equal(balance([], 0), 0); assert.equal(income([]), 0); assert.equal(expenses([]), 0); });
test('negative balances are valid', () => assert.equal(balance([records[1]]), -250000));
test('integer overflow is rejected', () => assert.throws(() => income([tx({ amount: Number.MAX_SAFE_INTEGER }), tx({ amount: 1 })])));
test('monthly filtering includes endpoints and excludes other months', () => assert.deepEqual(filterDates(records, monthRange('2026-11')).map(t => t.id), ['t1', 't2']));
test('open-ended date filters', () => assert.equal(filterDates(records, { to: '2026-10-31' }).length, 1));
test('reversed ranges rejected', () => assert.throws(() => filterDates(records, { from: '2026-11-20', to: '2026-11-01' })));
test('calendar validation checks leap years', () => { assert.equal(isDate('2024-02-29'), true); assert.equal(isDate('2026-02-29'), false); assert.equal(isDate('2026-04-31'), false); assert.equal(isDate('2026-13-01'), false); });
test('month range respects leap years', () => assert.equal(monthRange('2024-02').to, '2024-02-29'));
test('category budget utilization uses only matching month and category', () => {
  const usage = budgetUsage({ id: 'b', month: '2026-11', categoryId: 'expense-food', amount: 300000 }, records);
  assert.equal(usage.spent, 250000); assert.equal(usage.remaining, 50000); assert.equal(usage.status, 'warning'); assert.ok(Math.abs(usage.percent - 83.3333333) < .00001);
});
test('total monthly budgets include all categories', () => assert.equal(budgetUsage({ id: 'b', month: '2026-11', categoryId: null, amount: 200000 }, records).status, 'exceeded'));
test('zero budgets rejected', () => assert.throws(() => budgetUsage({ id: 'b', month: '2026-11', categoryId: null, amount: 0 }, records)));
test('goal progress and remaining amount', () => {
  const g = { id: 'g', name: 'Laptop', targetAmount: 10000000, savedAmount: 2500000, targetDate: '2027-01-01', description: '' };
  assert.deepEqual(goalProgress(g), { percent: 25, remaining: 7500000, complete: false });
  assert.deepEqual(goalProgress({ ...g, savedAmount: 12000000 }), { percent: 120, remaining: 0, complete: true });
});
test('zero goal targets rejected', () => assert.throws(() => goalProgress({ id: 'g', name: 'Bad', targetAmount: 0, savedAmount: 0, targetDate: '2027-01-01', description: '' })));
test('category breakdown has no NaN for empty datasets', () => assert.deepEqual(categoryBreakdown([], data.categories), []));
test('positive transaction validation', () => assert.equal(validateTransaction(tx(), data.categories).amount, 1000000));
test('invalid transaction inputs rejected', () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => validateTransaction(tx({ amount }), data.categories));
  assert.throws(() => validateTransaction(tx({ title: '   ' }), data.categories));
  assert.throws(() => validateTransaction(tx({ date: '2026-02-30' }), data.categories));
  assert.throws(() => validateTransaction(tx({ categoryId: 'expense-food' }), data.categories));
});
test('rupiah parsing does not round or accept scientific notation', () => { assert.equal(parseRupiah('25000'), 25000); for (const v of ['1.5', '1e3', '25,000', '-1', '']) assert.throws(() => parseRupiah(v)); });
test('editing updates the existing record and preserves identity and timestamp', () => {
  const result = saveTransaction({ ...data, transactions: [tx()] }, { ...tx(), title: 'Updated' }, 't1');
  assert.equal(result.transactions.length, 1); assert.equal(result.transactions[0].title, 'Updated'); assert.equal(result.transactions[0].createdAt, tx().createdAt);
});
test('editing missing record does not create duplicates', () => assert.throws(() => saveTransaction(data, tx(), 'missing')));
test('deleting removes the specified transaction', () => assert.equal(deleteTransaction({ ...data, transactions: [tx()] }, 't1').transactions.length, 0));
test('custom category CRUD', () => {
  const next = saveCategory(data, 'Gifts', 'income'); const c = next.categories.at(-1)!;
  const renamed = saveCategory(next, 'Presents', 'income', c.id); assert.equal(renamed.categories.at(-1)!.name, 'Presents');
  assert.equal(deleteCategory(renamed, c.id).categories.length, data.categories.length);
});
test('predefined categories cannot be deleted', () => assert.throws(() => deleteCategory(data, 'expense-food')));
test('used categories require reassignment', () => {
  const custom = { id: 'custom', name: 'Gifts', type: 'income' as const, predefined: false };
  const used = { ...data, categories: [...data.categories, custom], transactions: [tx({ categoryId: 'custom' })] };
  assert.throws(() => deleteCategory(used, 'custom'));
  assert.equal(deleteCategory(used, 'custom', 'income-allowance').transactions[0].categoryId, 'income-allowance');
});
test('CSV quotes commas, quotes and multiline descriptions', () => {
  const csv = transactionsCsv([tx({ title: 'Coffee, "large"', description: 'line1\nline2' })], data.categories);
  assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes('"Coffee, ""large"""')); assert.ok(csv.includes('"line1\nline2"')); assert.ok(csv.includes('"1000000"')); assert.ok(csv.includes('"Allowance"'));
});
test('CSV neutralizes formula-like text', () => assert.ok(transactionsCsv([tx({ title: '=HYPERLINK("x")' })], data.categories).includes('"\'=HYPERLINK')));
test('backup round trip', () => assert.deepEqual(parseBackup(JSON.stringify(data)), data));
test('malformed and future-version backups are rejected', () => { assert.throws(() => parseBackup('{')); assert.throws(() => validateData({ ...data, schemaVersion: 2 })); assert.throws(() => validateData({ ...data, transactions: [tx(), tx()] })); });
test('unknown fields are not copied from imported records', () => { const result = validateData({ ...data, injected: '<script>', transactions: [{ ...tx(), injected: true }] }); assert.equal('injected' in result, false); assert.equal('injected' in result.transactions[0], false); });
test('bad references and timestamps rejected', () => { assert.throws(() => validateData({ ...data, transactions: [tx({ categoryId: 'missing' })] })); assert.throws(() => validateData({ ...data, transactions: [tx({ createdAt: '2026-02-30T00:00:00.000Z' })] })); });
test('duplicate monthly category budgets rejected', () => assert.throws(() => validateData({ ...data, budgets: [{ id: 'a', month: '2026-11', categoryId: null, amount: 1000 }, { id: 'b', month: '2026-11', categoryId: null, amount: 2000 }] })));
test('memory repository returns independent snapshots and rejects stale updates', () => {
  const repo = new MemoryRepository(); const first = repo.load(); first.settings.profileName = 'Changed'; assert.equal(repo.load().settings.profileName, '');
  repo.save(first, 0); assert.equal(repo.load().revision, 1); assert.throws(() => repo.save(first, 0));
});
test('local storage round trip', () => {
  const map = new Map<string, string>(); const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } };
  const repo = new LocalStorageRepository(storage); repo.save({ ...repo.load(), transactions: [tx()] }, 0); assert.equal(repo.load().transactions.length, 1); assert.equal(repo.load().revision, 1);
});
test('storage failure is surfaced without pretending a save succeeded', () => {
  const repo = new LocalStorageRepository({ getItem: () => null, setItem: () => { throw new Error('Quota'); } }); assert.throws(() => repo.save(data, 0), /Could not save/);
});
test('corrupt stored data is not silently overwritten', () => {
  let writes = 0; const repo = new LocalStorageRepository({ getItem: () => '{invalid', setItem: () => { writes++; } });
  assert.throws(() => repo.load()); assert.throws(() => repo.save(data, 0)); assert.equal(writes, 0); assert.ok(STORAGE_KEY.includes('v1'));
});
