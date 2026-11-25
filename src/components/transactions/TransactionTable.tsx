import { ArrowDownLeft, ArrowUpRight, Eye, Pencil, Trash2 } from 'lucide-react';
import type { AppData, Transaction } from '../../models/types';
import { money } from '../../utils/format';
export function TransactionTable({ records, categories, onEdit, onDelete, onView }: {
  records: Transaction[]; categories: AppData['categories']; onEdit: (t: Transaction) => void; onDelete: (t: Transaction) => void; onView: (t: Transaction) => void;
}) {
  if (!records.length) return <div className="empty"><span className="empty-symbol">↗</span><h3>No transactions found</h3><p>Add a transaction or adjust your filters.</p></div>;
  return <div className="table-scroll"><table><caption className="sr-only">Financial transactions</caption><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th className="align-right">Amount</th><th className="align-right">Actions</th></tr></thead>
    <tbody>{records.map(t => <tr key={t.id}><td><div className="transaction-title"><span className={`transaction-icon ${t.type}`}>{t.type === 'income' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}</span><div><strong>{t.title}</strong><small>{t.type === 'income' ? 'Income' : 'Expense'}</small></div></div></td>
    <td><span className="badge">{categories.find(c => c.id === t.categoryId)?.name ?? 'Unknown'}</span></td><td className="muted">{t.date}</td>
    <td className={`align-right amount ${t.type}`}>{t.type === 'expense' ? '−' : '+'}{money(t.amount)}</td><td><div className="row-actions"><button className="icon-button" aria-label={`View ${t.title}`} onClick={() => onView(t)}><Eye size={16}/></button><button className="icon-button" aria-label={`Edit ${t.title}`} onClick={() => onEdit(t)}><Pencil size={16}/></button><button className="icon-button danger" aria-label={`Delete ${t.title}`} onClick={() => onDelete(t)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>;
}
