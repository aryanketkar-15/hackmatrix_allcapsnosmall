import type { ComponentType } from 'react';
import type { AlertT, ScenarioT } from '../../types/contract';
import type { AlertTabId } from './tabs';
import { GraphTab } from '../graph/GraphTab';
import { TimelineTab } from '../timeline/TimelineTab';
import { EmployeeTab } from '../employee/EmployeeTab';
import { EvidenceTab } from '../evidence/EvidenceTab';
import { ButForTab } from '../replay/ButForTab';
import { NotesTab } from '../cases/NotesPanel';

export interface TabViewProps { alert: AlertT; scenario: ScenarioT | null }

/** Registry of tab bodies. Each later milestone replaces its entry. */
export const TAB_VIEWS: Record<Exclude<AlertTabId, 'overview'>, ComponentType<TabViewProps>> = {
  graph: GraphTab,
  timeline: TimelineTab,
  employee: EmployeeTab,
  evidence: EvidenceTab,
  'but-for': ButForTab,
  notes: NotesTab,
};
