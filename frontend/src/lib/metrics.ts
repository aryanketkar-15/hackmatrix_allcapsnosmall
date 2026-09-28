/** Pure metric functions. Every dashboard/analytics number is computed here from the data — never typed in. */
import type { AlertLevelT, AlertT, AlertTypeT, ListFactsT, ScenarioT } from '../types/contract';
import { dateKeyIST } from './format';

const DAY = 86_400_000;

export function countBy<T, K extends string>(items: T[], key: (t: T) => K): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const it of items) out[key(it)] = (out[key(it)] ?? 0) + 1;
  return out;
}

export interface Kpi { value: number; delta: { pct: number; label: string } | null }
export interface KpiSet { total: Kpi; high: Kpi; underInvestigation: Kpi; closedThisWeek: Kpi }

function deltaPct(cur: number, prev: number): { pct: number; label: string } | null {
  if (prev <= 0) return null;
  return { pct: Math.round(((cur - prev) / prev) * 100), label: 'from last week' };
}

/** KPI values and week-on-week deltas (deltas are hidden when there is no prior-week data to compare with). */
export function computeKpis(alerts: AlertT[], asOfIso: string): KpiSet {
  const asOf = new Date(asOfIso).getTime();
  const inWindow = (iso: string | null, from: number, to: number) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t > from && t <= to;
  };
  const created = (a: AlertT, from: number, to: number) => inWindow(a.createdAt, from, to);
  const thisWeek = [asOf - 7 * DAY, asOf] as const;
  const prevWeek = [asOf - 14 * DAY, asOf - 7 * DAY] as const;

  const total = alerts.length;
  const high = alerts.filter((a) => a.level === 'HIGH').length;
  const under = alerts.filter((a) => a.status === 'INVESTIGATING' || a.status === 'PENDING_EVIDENCE').length;
  const closedNow = alerts.filter((a) => inWindow(a.closedAt, ...thisWeek)).length;
  const closedPrev = alerts.filter((a) => inWindow(a.closedAt, ...prevWeek)).length;

  return {
    total: { value: total, delta: deltaPct(alerts.filter((a) => created(a, ...thisWeek)).length, alerts.filter((a) => created(a, ...prevWeek)).length) },
    high: {
      value: high,
      delta: deltaPct(
        alerts.filter((a) => a.level === 'HIGH' && created(a, ...thisWeek)).length,
        alerts.filter((a) => a.level === 'HIGH' && created(a, ...prevWeek)).length,
      ),
    },
    underInvestigation: { value: under, delta: null }, // no status history in the data, so no honest delta
    closedThisWeek: { value: closedNow, delta: deltaPct(closedNow, closedPrev) },
  };
}

export const TREND_LEVELS = ['HIGH', 'MEDIUM', 'WATCH'] as const;
export interface TrendPoint { dayKey: string; label: string; HIGH: number; MEDIUM: number; WATCH: number }

/** Daily alert counts per level across an inclusive IST day range. */
export function trendSeries(alerts: AlertT[], startKey: string, endKey: string): TrendPoint[] {
  const points: TrendPoint[] = [];
  const start = new Date(`${startKey}T00:00:00+05:30`).getTime();
  const end = new Date(`${endKey}T00:00:00+05:30`).getTime();
  const index = new Map<string, TrendPoint>();
  for (let t = start; t <= end; t += DAY) {
    const key = dateKeyIST(new Date(t).toISOString());
    const p: TrendPoint = { dayKey: key, label: new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }), HIGH: 0, MEDIUM: 0, WATCH: 0 };
    points.push(p);
    index.set(key, p);
  }
  for (const a of alerts) {
    const p = index.get(dateKeyIST(a.createdAt));
    if (p && (TREND_LEVELS as readonly string[]).includes(a.level)) p[a.level as (typeof TREND_LEVELS)[number]] += 1;
  }
  return points;
}

/** Percentages that always total exactly 100 (largest-remainder rounding). */
export function percentages(counts: number[]): number[] {
  const total = counts.reduce((s, c) => s + c, 0);
  if (total === 0) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const floors = raw.map(Math.floor);
  let rest = 100 - floors.reduce((s, f) => s + f, 0);
  const order = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) { if (rest <= 0) break; floors[i] += 1; rest -= 1; }
  return floors;
}

export const DONUT_ORDER: AlertLevelT[] = ['HIGH', 'MEDIUM', 'WATCH', 'DATA_GAP', 'NEAR_MISS', 'INFO'];

export function riskDistribution(alerts: AlertT[]) {
  const counts = DONUT_ORDER.map((l) => alerts.filter((a) => a.level === l).length);
  const pct = percentages(counts);
  return DONUT_ORDER.map((level, i) => ({ level, count: counts[i], pct: pct[i] }));
}

export function topPatterns(alerts: AlertT[], n = 7): { type: AlertTypeT; count: number }[] {
  const counts = countBy(alerts, (a) => a.type);
  return (Object.entries(counts) as [AlertTypeT, number][])
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
    .slice(0, n);
}

/** Weekly buckets (Apr 1-7, 8-14, ...) per alert type for the analytics trend chart. */
export function weeklyByType(alerts: AlertT[], startKey: string, weeks: number, types: AlertTypeT[]) {
  const start = new Date(`${startKey}T00:00:00+05:30`).getTime();
  const rows = Array.from({ length: weeks }, (_, w) => ({
    label: `Week ${w + 1}`,
    ...Object.fromEntries(types.map((t) => [t, 0])),
  })) as ({ label: string } & Record<AlertTypeT, number>)[];
  for (const a of alerts) {
    if (!types.includes(a.type)) continue;
    const w = Math.min(weeks - 1, Math.max(0, Math.floor((new Date(a.createdAt).getTime() - start) / (7 * DAY))));
    rows[w][a.type] += 1;
  }
  return rows;
}

/** Facts derived from a scenario's own transactions (must equal `Alert.listFacts` for FULL alerts). */
export function deriveAlertFacts(s: ScenarioT): ListFactsT {
  const victims = new Set(s.victimAccountIds);
  const times = s.transactions.map((t) => t.at).sort();
  return {
    amountAtRisk: s.transactions
      .filter((t) => victims.has(t.from) && ['TRANSFER', 'PAYROLL', 'SWEEP'].includes(t.kind))
      .reduce((sum, t) => sum + t.amount, 0),
    accountsCount: s.nodes.filter((n) => n.kind === 'account').length,
    employeesCount: s.employeeIds.length,
    customersCount: s.customerIds.length,
    beneficiariesCount: s.beneficiaryIds.length,
    transactionsCount: s.transactions.length,
    firstTxnAt: times[0],
    lastTxnAt: times[times.length - 1],
  };
}

export function involvedEntitiesText(f: ListFactsT): string {
  const p = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  return [p(f.accountsCount, 'account'), p(f.employeesCount, 'employee')].join(', ');
}
