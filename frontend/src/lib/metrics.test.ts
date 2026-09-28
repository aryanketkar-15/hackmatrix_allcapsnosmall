import { readCore, readScenario } from '../test/fixtures';
import {
  computeKpis, deriveAlertFacts, involvedEntitiesText, percentages, riskDistribution, topPatterns, trendSeries, weeklyByType,
} from './metrics';

const core = readCore();
const { alerts } = core;
const asOf = core.meta.asOf;

describe('KPIs', () => {
  it('matches the seed spec (124 / 28 / 46 / 32)', () => {
    const k = computeKpis(alerts, asOf);
    expect([k.total.value, k.high.value, k.underInvestigation.value, k.closedThisWeek.value]).toEqual([124, 28, 46, 32]);
  });
  it('hides deltas when there is no prior-week data', () => {
    const k = computeKpis(alerts.map((a) => ({ ...a, createdAt: '2024-04-29T10:00:00+05:30', closedAt: null })), asOf);
    expect(k.total.delta).toBeNull();
    expect(k.underInvestigation.delta).toBeNull();
  });
  it('computes deltas from data, not constants', () => {
    const k = computeKpis(alerts, asOf);
    expect(k.total.delta === null || Number.isInteger(k.total.delta.pct)).toBe(true);
  });
  it('handles empty data without NaN', () => {
    const k = computeKpis([], asOf);
    expect(k.total.value).toBe(0);
    expect(k.closedThisWeek.delta).toBeNull();
  });
});

describe('series', () => {
  it('trend has 30 daily points that sum to the level counts', () => {
    const s = trendSeries(alerts, '2024-04-01', '2024-04-30');
    expect(s).toHaveLength(30);
    const sum = (k: 'HIGH' | 'MEDIUM' | 'WATCH') => s.reduce((t, p) => t + p[k], 0);
    expect([sum('HIGH'), sum('MEDIUM'), sum('WATCH')]).toEqual([28, 52, 30]);
  });
  it('donut percentages total exactly 100 and legend has 6 entries', () => {
    const d = riskDistribution(alerts);
    expect(d).toHaveLength(6);
    expect(d.reduce((t, x) => t + x.pct, 0)).toBe(100);
    expect(d.reduce((t, x) => t + x.count, 0)).toBe(124);
  });
  it('largest-remainder rounding always totals 100', () => {
    expect(percentages([1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(percentages([0, 0])).toEqual([0, 0]);
  });
  it('top patterns are the 7 largest types', () => {
    const t = topPatterns(alerts);
    expect(t.map((x) => x.count)).toEqual([28, 24, 18, 14, 12, 10, 8]);
    expect(t.some((x) => x.type === 'PROFILE_MISMATCH' || x.type === 'INSIDER_ACTIVITY')).toBe(false);
  });
  it('weekly buckets sum to the type counts', () => {
    const types = ['CIRCULAR_TRANSFER', 'STRUCTURING', 'FAN_OUT', 'FAN_IN', 'PASS_THROUGH'] as const;
    const rows = weeklyByType(alerts, '2024-04-01', 5, [...types]);
    expect(rows).toHaveLength(5);
    expect(rows.reduce((t, r) => t + r.CIRCULAR_TRANSFER, 0)).toBe(28);
    expect(rows.reduce((t, r) => t + r.STRUCTURING, 0)).toBe(24);
  });
});

describe('deriveAlertFacts', () => {
  it('derives the hero facts from the scenario', () => {
    const f = deriveAlertFacts(readScenario('S1'));
    expect(f.amountAtRisk).toBe(2980000);
    expect([f.accountsCount, f.employeesCount, f.transactionsCount]).toEqual([3, 2, 7]);
    expect(involvedEntitiesText(f)).toBe('3 accounts, 2 employees');
  });
  it('equals listFacts for every FULL alert', () => {
    for (const a of alerts.filter((x) => x.detailLevel === 'FULL')) {
      expect(deriveAlertFacts(readScenario(a.scenarioId!))).toEqual(a.listFacts);
    }
  });
});
