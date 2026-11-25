import { useEffect, useState } from 'react';
import { AppLayout, type Page } from './components/layout/AppLayout';
import { Dialog } from './components/common/Dialog';
import { TransactionForm } from './components/transactions/TransactionForm';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { useFinance } from './hooks/useFinance';
import { deleteTransaction, saveTransaction } from './services/commands';
import { isMonth, monthRange, today } from './utils/dates';
import { money } from './utils/format';
import type { DateRange, Transaction } from './models/types';
function route(): Page { return location.hash === '#/transactions' ? 'transactions' : 'dashboard'; }
export default function App() {
  const { data, error, commit, reload } = useFinance();
  const [page, setPage] = useState<Page>(route); const [month, setMonth] = useState(today().slice(0, 7));
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [editor, setEditor] = useState<Transaction | 'new' | null>(null); const [deleting, setDeleting] = useState<Transaction | null>(null); const [viewing, setViewing] = useState<Transaction | null>(null);
  const [toast, setToast] = useState(''); const [actionError, setActionError] = useState('');
  useEffect(() => { const sync = () => setPage(route()); window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);
  if (error) return <main className="startup"><h1>We couldn’t open your workspace</h1><p role="alert">{error}</p><p>Your stored data has not been replaced. Do not clear browser storage if you need to recover it.</p><button className="button primary" onClick={reload}>Try again</button></main>;
  if (!data) return <main className="startup" role="status">Opening your FINORA workspace…</main>;
  const custom = Boolean(from || to); const validRange = !(from && to && from > to);
  const range: DateRange = custom ? { from: from || undefined, to: to || undefined } : monthRange(month);
  const actions = { onEdit: (t: Transaction) => { setEditor(t); setViewing(null); }, onDelete: (t: Transaction) => { setDeleting(t); setActionError(''); }, onView: setViewing };
  return <AppLayout page={page} onNavigate={setPage} onAdd={() => setEditor('new')}>
    <section className="period-bar" aria-label="Date filters"><label>Month<input type="month" min="1900-01" max="9999-12" value={month} disabled={custom} onChange={e => { if (isMonth(e.target.value)) setMonth(e.target.value); }}/></label><span className="muted">or a custom range</span><label>From<input type="date" min="1900-01-01" max="9999-12-31" value={from} onChange={e => setFrom(e.target.value)}/></label><label>To<input type="date" min="1900-01-01" max="9999-12-31" value={to} onChange={e => setTo(e.target.value)}/></label>{custom && <button className="button secondary" onClick={() => { setFrom(''); setTo(''); }}>Clear range</button>}</section>
    {!validRange ? <p className="error-message" role="alert">Start date must precede end date.</p> : page === 'dashboard' ? <Dashboard data={data} range={range} {...actions}/> : <Transactions data={data} range={range} notify={setToast} {...actions}/>}
    {editor && <TransactionForm key={editor === 'new' ? 'new' : editor.id} categories={data.categories} transaction={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSave={input => { commit(current => saveTransaction(current, input, editor === 'new' ? undefined : editor.id)); setToast(editor === 'new' ? 'Transaction added.' : 'Transaction updated.'); }}/ >}
    {deleting && <Dialog title="Delete transaction?" onClose={() => setDeleting(null)}><p>Delete “{deleting.title}” for {money(deleting.amount)}? This cannot be undone.</p>{actionError && <p role="alert" className="error-message">{actionError}</p>}<footer className="dialog-actions"><button className="button secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="button destructive" onClick={() => { try { commit(current => deleteTransaction(current, deleting.id)); setDeleting(null); setToast('Transaction deleted.'); } catch (e) { setActionError(e instanceof Error ? e.message : 'Unable to delete.'); } }}>Delete transaction</button></footer></Dialog>}
    {viewing && <Dialog title="Transaction details" onClose={() => setViewing(null)}><dl className="details"><dt>Title</dt><dd>{viewing.title}</dd><dt>Amount</dt><dd>{money(viewing.amount)}</dd><dt>Type</dt><dd>{viewing.type}</dd><dt>Category</dt><dd>{data.categories.find(c => c.id === viewing.categoryId)?.name}</dd><dt>Date</dt><dd>{viewing.date}</dd><dt>Description</dt><dd className="preserve-text">{viewing.description || 'No description'}</dd><dt>Created at</dt><dd>{viewing.createdAt}</dd><dt>ID</dt><dd>{viewing.id}</dd></dl><footer className="dialog-actions"><button className="button primary" onClick={() => { setEditor(viewing); setViewing(null); }}>Edit transaction</button></footer></Dialog>}
    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div>
  </AppLayout>;
}
