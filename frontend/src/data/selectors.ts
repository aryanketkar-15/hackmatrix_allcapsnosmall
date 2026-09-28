import type { AlertT, CaseT, CustomerT, EmployeeT, ScenarioT } from '../types/contract';
import type { StoreState } from './store';

export const alertById = (alerts: AlertT[], id: string | undefined) => alerts.find((a) => a.id === id);
export const caseForAlert = (cases: CaseT[], alertId: string) => cases.find((c) => c.alertId === alertId);
export const customerById = (customers: CustomerT[], id: string | undefined) => customers.find((c) => c.id === id);
export const employeeById = (employees: EmployeeT[], id: string | undefined) => employees.find((e) => e.id === id);

/** Alerts newest first. */
export const alertsNewestFirst = (alerts: AlertT[]) => [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const twinOf = (all: ScenarioT[], s: ScenarioT | null | undefined) =>
  s ? all.find((x) => x.twinOf === s.id) ?? null : null;

export const loadedScenarios = (state: StoreState) => Object.values(state.scenarios);
