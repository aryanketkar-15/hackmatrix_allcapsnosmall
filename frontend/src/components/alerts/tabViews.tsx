import type { ComponentType } from 'react';
import type { AlertT, ScenarioT } from '../../types/contract';
import type { AlertTabId } from './tabs';
import { GraphTab } from '../graph/GraphTab';
import { TimelineTab } from '../timeline/TimelineTab';
import { EmployeeTab } from '../employee/EmployeeTab';
import { EvidenceTab } from '../evidence/EvidenceTab';

export interface TabViewProps { alert: AlertT; scenario: ScenarioT | null }

const Pending = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">{label} is built in a later milestone.</div>
);

/** Registry of tab bodies. Each later milestone replaces its entry. */
export const TAB_VIEWS: Record<Exclude<AlertTabId, 'overview'>, ComponentType<TabViewProps>> = {
  graph: GraphTab,
  timeline: TimelineTab,
  employee: EmployeeTab,
  evidence: EvidenceTab,
  'but-for': () => <Pending label="But-for Analysis" />,
  notes: () => <Pending label="Notes" />,
};
