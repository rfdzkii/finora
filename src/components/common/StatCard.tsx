import type { LucideIcon } from 'lucide-react';
import { money } from '../../utils/format';
export function StatCard({ label, amount, icon: Icon, tone = 'neutral', caption }: {
  label: string; amount: number; icon: LucideIcon; tone?: 'neutral' | 'income' | 'expense'; caption: string;
}) {
  return <article className={`card stat ${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19}/></span></div>
    <strong className="stat-value">{money(amount)}</strong><span className="muted text-xs">{caption}</span></article>;
}
