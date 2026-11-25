export function money(amount: number, display: 'symbol' | 'code' = 'symbol'): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR',
    currencyDisplay: display, maximumFractionDigits: 0 }).format(amount);
}
export function parseRupiah(raw: string): number {
  if (!/^\d+$/.test(raw)) throw new Error('Enter whole rupiah digits without separators.');
  const n = Number(raw);
  if (!Number.isSafeInteger(n)) throw new Error('Amount is too large.');
  return n;
}
