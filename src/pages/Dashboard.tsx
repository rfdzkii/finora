import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import type { AppData, DateRange, Transaction } from '../models/types';
import { balance, income, expenses, netSavings } from '../utils/finance';
import { filterDates } from '../utils/dates';
import { StatCard } from '../components/common/StatCard';
import { Charts } from '../components/dashboard/Charts';
import { TransactionTable } from '../components/transactions/TransactionTable';
export function Dashboard({ data, range, onEdit, onDelete, onView }: {
  data: AppData; range: DateRange; onEdit: (t: Transaction) => void; onDelete: (t: Transaction) => void; onView: (t: Transaction) => void;
}) {
  const records = filterDates(data.transactions, range);
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return <><section className="stats-grid"><StatCard label="Total balance" amount={balance(data.transactions, data.settings.initialBalance)} icon={Wallet} caption="All-time balance, including initial balance"/>
    <StatCard label="Total income" amount={income(records)} icon={ArrowDownLeft} tone="income" caption="Selected period"/>
    <StatCard label="Total expenses" amount={expenses(records)} icon={ArrowUpRight} tone="expense" caption="Selected period"/>
    <StatCard label="Net savings" amount={netSavings(records)} icon={PiggyBank} caption="Income minus expenses · selected period"/></section>
    <Charts records={records} categories={data.categories}/>
    <section className="card"><div className="section-heading"><div><h2>Recent transactions</h2><p>Your five most recent records in this period</p></div><span className="badge">{records.length} records</span></div><TransactionTable records={recent} categories={data.categories} onEdit={onEdit} onDelete={onDelete} onView={onView}/></section>
  </>;
}
