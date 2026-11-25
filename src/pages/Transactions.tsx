import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import type { AppData, DateRange, Transaction } from '../models/types';
import { filterDates } from '../utils/dates';
import { transactionsCsv } from '../utils/csv';
import { TransactionTable } from '../components/transactions/TransactionTable';
export function Transactions({ data, range, onEdit, onDelete, onView, notify }: {
  data: AppData; range: DateRange; onEdit: (t: Transaction) => void; onDelete: (t: Transaction) => void; onView: (t: Transaction) => void; notify: (message: string) => void;
}) {
  const [search, setSearch] = useState(''); const [type, setType] = useState('all');
  const [category, setCategory] = useState('all'); const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1); const pageSize = 15;
  const filtered = useMemo(() => filterDates(data.transactions, range)
    .filter(t => (type === 'all' || t.type === type) && (category === 'all' || t.categoryId === category)
      && `${t.title} ${t.description}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sort === 'highest' ? b.amount - a.amount : sort === 'lowest' ? a.amount - b.amount : sort === 'oldest' ? a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) : b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)), [data, range, type, category, search, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const current = Math.min(page, pages);
  function exportCsv() {
    const blob = new Blob([transactionsCsv(filtered, data.categories)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'finora-transactions.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify(`Exported ${filtered.length} transactions.`);
  }
  return <section className="card"><div className="section-heading"><div><h2>Your transactions</h2><p>Search, organize, and export your financial activity</p></div><button className="button secondary" onClick={exportCsv}><Download size={16}/>Export CSV</button></div>
    <div className="filters"><label className="search-field"><span className="sr-only">Search transactions</span><Search size={17}/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search title or description…"/></label>
      <label><span className="sr-only">Transaction type</span><select value={type} onChange={e => { setType(e.target.value); setCategory('all'); setPage(1); }}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
      <label><span className="sr-only">Category</span><select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="all">All categories</option>{data.categories.filter(c => type === 'all' || c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label><span className="sr-only">Sort transactions</span><select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest amount</option><option value="lowest">Lowest amount</option></select></label>
    </div><TransactionTable records={filtered.slice((current - 1) * pageSize, current * pageSize)} categories={data.categories} onEdit={onEdit} onDelete={onDelete} onView={onView}/>
    <footer className="pagination"><span className="muted">{filtered.length} records · Page {current} of {pages}</span><div><button className="button secondary" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button><button className="button secondary" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button></div></footer>
  </section>;
}
