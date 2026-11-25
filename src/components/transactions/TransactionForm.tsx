import { useState, type FormEvent } from 'react';
import type { Category, Transaction, TransactionInput, TransactionType } from '../../models/types';
import { today } from '../../utils/dates';
import { parseRupiah } from '../../utils/format';
import { validateTransaction } from '../../services/validation';
import { Dialog } from '../common/Dialog';
export function TransactionForm({ categories, transaction, onSave, onClose }: {
  categories: Category[]; transaction?: Transaction; onSave: (input: TransactionInput) => void; onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [title, setTitle] = useState(transaction?.title ?? '');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? categories.find(c => c.type === 'expense')?.id ?? '');
  const [date, setDate] = useState(transaction?.date ?? today());
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault(); if (saving) return;
    setError(''); setSaving(true);
    try { onSave(validateTransaction({ title, amount: parseRupiah(amount), type, categoryId, date, description }, categories)); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); setSaving(false); }
  }
  function changeType(next: TransactionType) {
    setType(next); setCategoryId(categories.find(c => c.type === next)?.id ?? '');
  }
  return <Dialog title={transaction ? 'Edit transaction' : 'New transaction'} onClose={onClose}>
    <form onSubmit={submit} className="form-stack">
      {error && <p role="alert" className="error-message">{error}</p>}
      <label>Type<select value={type} onChange={e => changeType(e.target.value as TransactionType)}><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Title<input autoFocus required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Campus lunch"/></label>
      <label>Amount (IDR)<input required inputMode="numeric" pattern="[0-9]+" value={amount} onChange={e => setAmount(e.target.value)} placeholder="25000"/><small className="muted">Whole rupiah, without separators.</small></label>
      <div className="form-grid"><label>Category<select required value={categoryId} onChange={e => setCategoryId(e.target.value)}>{categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Date<input type="date" min="1900-01-01" max="9999-12-31" required value={date} onChange={e => setDate(e.target.value)}/></label></div>
      <label>Description<textarea maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes" rows={3}/></label>
      <footer className="dialog-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Save transaction'}</button></footer>
    </form>
  </Dialog>;
}
