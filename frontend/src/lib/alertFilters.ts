import type { AlertLevelT, AlertT, AlertTypeT } from '../types/contract';
import { dateKeyIST } from './format';

export interface AlertFilters {
  q: string;
  type: AlertTypeT | '';
  level: AlertLevelT | '';
  from: string; // YYYY-MM-DD (inclusive, IST)
  to: string; // YYYY-MM-DD (inclusive, IST): the whole end day is included
}

export const EMPTY_FILTERS: AlertFilters = { q: '', type: '', level: '', from: '', to: '' };

export function filterAlerts(alerts: AlertT[], f: AlertFilters): AlertT[] {
  const q = f.q.trim().toLowerCase();
  return alerts.filter((a) => {
    if (f.level && a.level !== f.level) return false;
    if (f.type && a.type !== f.type) return false;
    if (q && !(a.id.toLowerCase().includes(q) || a.title.toLowerCase().includes(q))) return false;
    if (f.from || f.to) {
      const day = dateKeyIST(a.createdAt);
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
    }
    return true;
  });
}

export const PAGE_SIZE = 10;
export const pageCount = (n: number, size = PAGE_SIZE) => Math.max(1, Math.ceil(n / size));
