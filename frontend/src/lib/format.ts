const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹29,80,000 (Indian digit grouping). Non-finite input renders as an em dash. */
export function formatInr(n: number | null | undefined): string {
  return typeof n === 'number' && Number.isFinite(n) ? inr.format(n) : '—';
}

const IST = 'Asia/Kolkata';

function parts(iso: string, opts: Intl.DateTimeFormatOptions, locale = 'en-US'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { timeZone: IST, hourCycle: 'h23', ...opts }).format(d);
}

/** "Apr 30, 2024, 09:12" */
export const formatDateTimeIST = (iso: string) =>
  parts(iso, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** "09:12" */
export const formatTimeIST = (iso: string) => parts(iso, { hour: '2-digit', minute: '2-digit' });

/** "Apr 30, 2024" */
export const formatDateIST = (iso: string) => parts(iso, { month: 'short', day: 'numeric', year: 'numeric' });

/** "Apr 30" */
export const formatDayMonthIST = (iso: string) => parts(iso, { month: 'short', day: 'numeric' });

/** "2024-04-30" (calendar day in IST) */
export function dateKeyIST(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Relative to the fixture as-of time: "Today 10:50", "Yesterday 19:33", else "Apr 26". */
export function formatRelativeToAsOf(iso: string, asOfIso: string): string {
  const key = dateKeyIST(iso);
  if (!key) return '—';
  const today = dateKeyIST(asOfIso);
  const yesterday = dateKeyIST(new Date(new Date(asOfIso).getTime() - 86_400_000).toISOString());
  if (key === today) return `Today ${formatTimeIST(iso)}`;
  if (key === yesterday) return `Yesterday ${formatTimeIST(iso)}`;
  return `${formatDayMonthIST(iso)} ${formatTimeIST(iso)}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
