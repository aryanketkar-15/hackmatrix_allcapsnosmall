import type { CustomerT } from '../types/contract';

export interface ProfileAnalysis {
  hasFlows: boolean;
  declaredMonthly: number;
  latestMonth: string;
  observedInflow: number;
  observedOutflow: number;
  /** observed monthly inflow ÷ declared monthly income (null when there is nothing to compare) */
  ratio: number | null;
  /** outflow ÷ inflow in the latest month: close to 1 means funds pass straight through */
  passThrough: number | null;
  /** latest inflow ÷ the customer's earlier average inflow (history break) */
  historyBreak: number | null;
}

/** Pure, NaN-safe profile analysis from the customer's declared income and monthly flows. */
export function analyzeProfile(c: CustomerT): ProfileAnalysis {
  const declaredMonthly = Math.round(c.annualIncome / 12);
  const flows = c.monthlyFlows;
  if (flows.length === 0) {
    return { hasFlows: false, declaredMonthly, latestMonth: '', observedInflow: 0, observedOutflow: 0, ratio: null, passThrough: null, historyBreak: null };
  }
  const latest = flows[flows.length - 1];
  const earlier = flows.slice(0, -1);
  const baseline = earlier.length ? earlier.reduce((s, f) => s + f.inflow, 0) / earlier.length : 0;
  return {
    hasFlows: true,
    declaredMonthly,
    latestMonth: latest.month,
    observedInflow: latest.inflow,
    observedOutflow: latest.outflow,
    ratio: declaredMonthly > 0 ? latest.inflow / declaredMonthly : null,
    passThrough: latest.inflow > 0 ? latest.outflow / latest.inflow : null,
    historyBreak: baseline > 0 ? latest.inflow / baseline : null,
  };
}
