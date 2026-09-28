import type { AlertT } from '../../types/contract';

export const ALERT_TABS = [
  { id: 'overview', label: 'Overview', fullOnly: false },
  { id: 'graph', label: 'Transaction Graph', fullOnly: true },
  { id: 'timeline', label: 'Timeline', fullOnly: true },
  { id: 'employee', label: 'Employee Activity', fullOnly: true },
  { id: 'evidence', label: 'Evidence', fullOnly: false },
  { id: 'but-for', label: 'But-for Analysis', fullOnly: true },
  { id: 'notes', label: 'Notes', fullOnly: false },
] as const;

export type AlertTabId = (typeof ALERT_TABS)[number]['id'];

export const SUMMARY_ONLY_NOTE = 'Full reconstruction is included only for scenario alerts in this prototype.';

export const isTabId = (t: string | undefined): t is AlertTabId => ALERT_TABS.some((x) => x.id === t);

/** SUMMARY alerts only enable Overview, Evidence and Notes. */
export const tabEnabled = (tab: (typeof ALERT_TABS)[number], alert: AlertT) => !tab.fullOnly || alert.detailLevel === 'FULL';
