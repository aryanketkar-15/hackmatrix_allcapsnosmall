/**
 * KHOJI data contract v2 (zod). Mirrored by backend/app/models.py (pydantic).
 * Every object is strict: unknown keys (e.g. a numeric `riskScore`) are rejected.
 */
import { z } from 'zod';

// ---------- enums ----------
export const ALERT_LEVELS = ['HIGH', 'MEDIUM', 'WATCH', 'NEAR_MISS', 'DATA_GAP', 'INFO'] as const;
export const ALERT_TYPES = [
  'CIRCULAR_TRANSFER', 'STRUCTURING', 'FAN_OUT', 'FAN_IN', 'PASS_THROUGH',
  'BENEFICIARY_MANIPULATION', 'DORMANT_ACTIVATION', 'PROFILE_MISMATCH', 'INSIDER_ACTIVITY',
] as const;
export const ALERT_STATUSES = [
  'NEW', 'UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATING', 'PENDING_EVIDENCE', 'DECIDED', 'CLOSED',
] as const;
export const CONNECTION_TYPES = ['STATE_DEPENDENCY', 'APPROVAL', 'ONBOARDING', 'PROFILE_EDIT', 'INFRASTRUCTURE'] as const;
export const DEPENDENCY_ROLES = ['NECESSARY', 'JOINTLY_NECESSARY', 'CONTRIBUTORY', 'CONCEALING', 'IRRELEVANT'] as const;
export const AUTH_GRADES = ['A', 'B', 'C', 'D', 'E', 'X', 'U'] as const;
export const CONTROL_INTEGRITY = ['GENUINE', 'HOLLOW', 'UNKNOWN'] as const;
export const TIMELINE_CATEGORIES = ['EMPLOYEE_ACTIVITY', 'ACCOUNT_STATE_CHANGE', 'CONTROL_CHECK', 'TRANSACTION'] as const;
export const EVIDENCE_STATUSES = ['FOUND', 'NOT_FOUND', 'MISSING', 'TAINTED', 'AVAILABLE', 'NOT_AVAILABLE'] as const;
export const DETAIL_LEVELS = ['FULL', 'SUMMARY'] as const;
export const SIGNAL_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'] as const;
export const DECISION_TYPES = [
  'INSIDER_CONNECTED', 'EXTERNAL_FRAUD', 'CUSTOMER_DISPUTE', 'PROCESS_VIOLATION', 'FALSE_POSITIVE', 'INCONCLUSIVE',
] as const;
export const SCENARIO_KINDS = ['ATTACK', 'TWIN', 'SWEEP', 'GAP', 'NEAR_MISS'] as const;

export const AlertLevel = z.enum(ALERT_LEVELS);
export const AlertType = z.enum(ALERT_TYPES);
export const AlertStatus = z.enum(ALERT_STATUSES);
export const ConnectionType = z.enum(CONNECTION_TYPES);
export const DependencyRole = z.enum(DEPENDENCY_ROLES);
export const AuthGrade = z.enum(AUTH_GRADES);
export const ControlIntegrity = z.enum(CONTROL_INTEGRITY);
export const TimelineCategory = z.enum(TIMELINE_CATEGORIES);
export const EvidenceStatus = z.enum(EVIDENCE_STATUSES);
export const DetailLevel = z.enum(DETAIL_LEVELS);
export const SignalId = z.enum(SIGNAL_IDS);
export const DecisionType = z.enum(DECISION_TYPES);
export const ScenarioKind = z.enum(SCENARIO_KINDS);

export type AlertLevelT = z.infer<typeof AlertLevel>;
export type AlertTypeT = z.infer<typeof AlertType>;
export type AlertStatusT = z.infer<typeof AlertStatus>;

/** Display labels. DATA_GAP is shown as "Inconclusive", INFO as "Explained" (deviation C7). */
export const LEVEL_LABEL = {
  HIGH: 'High', MEDIUM: 'Medium', WATCH: 'Watch', NEAR_MISS: 'Near-miss', DATA_GAP: 'Inconclusive', INFO: 'Explained',
} as const satisfies Record<AlertLevelT, string>;

export const STATUS_LABEL = {
  NEW: 'New', UNDER_REVIEW: 'Under Review', ASSIGNED: 'Assigned', INVESTIGATING: 'Investigating',
  PENDING_EVIDENCE: 'Pending Evidence', DECIDED: 'Decided', CLOSED: 'Closed',
} as const satisfies Record<AlertStatusT, string>;

export const TYPE_LABEL = {
  CIRCULAR_TRANSFER: 'Circular Transfer', STRUCTURING: 'Structuring', FAN_OUT: 'Fan-out', FAN_IN: 'Fan-in',
  PASS_THROUGH: 'Pass-through', BENEFICIARY_MANIPULATION: 'Beneficiary Manipulation',
  DORMANT_ACTIVATION: 'Dormant Activation', PROFILE_MISMATCH: 'Profile Mismatch', INSIDER_ACTIVITY: 'Insider Activity',
} as const satisfies Record<AlertTypeT, string>;

export const DECISION_LABEL = {
  INSIDER_CONNECTED: 'Insider-connected', EXTERNAL_FRAUD: 'External fraud', CUSTOMER_DISPUTE: 'Customer dispute',
  PROCESS_VIOLATION: 'Process violation', FALSE_POSITIVE: 'False positive', INCONCLUSIVE: 'Inconclusive',
} as const satisfies Record<(typeof DECISION_TYPES)[number], string>;

// ---------- id / format patterns ----------
export const ALERT_ID_RE = /^ALT-\d{4}-\d{3}$/;
export const CASE_ID_RE = /^CASE-\d{3}$/;
export const EMPLOYEE_ID_RE = /^E\d{2,3}$/;
export const CUSTOMER_ID_RE = /^C\d{3}$/;
export const ACCOUNT_ID_RE = /^[A-Z]-\d{3}$/;
export const TXN_ID_RE = /^T\d+$/;
/** Phones are stored masked only: six bullets then the last three digits. */
export const MASKED_PHONE_RE = /^•{6}\d{3}$/;

const iso = z.string().datetime({ offset: true });
const rupees = z.number().int().nonnegative();
const alertId = z.string().regex(ALERT_ID_RE);
const employeeId = z.string().regex(EMPLOYEE_ID_RE);
const customerId = z.string().regex(CUSTOMER_ID_RE);
const accountId = z.string().regex(ACCOUNT_ID_RE);
const so = z.strictObject;

// ---------- people ----------
export const User = so({
  id: z.string().regex(/^U\d+$/),
  username: z.string(),
  name: z.string(),
  role: z.string(),
  initials: z.string().min(1).max(3),
});

export const Employee = so({
  id: employeeId,
  name: z.string(),
  initials: z.string().min(1).max(3),
  role: z.string(),
  branch: z.string(),
  department: z.string(),
  status: z.enum(['Active', 'On leave', 'Inactive']),
  portfolio: z.string(),
  permissions: z.array(so({ name: z.string(), held: z.boolean() })),
  activities: z.array(so({
    at: iso, action: z.string(), account: z.string(), channel: z.string(), location: z.string(),
  })),
  behaviour: so({
    unusualTime: z.string(), outsidePortfolio: z.string(), highRisk: z.string(),
    overall: z.enum(['Low', 'Medium', 'High']),
  }),
  signalCount: z.number().int().nonnegative(),
});

export const Customer = so({
  id: customerId,
  name: z.string(),
  initials: z.string().min(1).max(3),
  type: z.enum(['Individual', 'Business']),
  kycRisk: z.enum(['Low', 'Medium', 'High']),
  verified: z.boolean(),
  age: z.number().int().nonnegative(),
  occupation: z.string(),
  annualIncome: rupees,
  location: z.string(),
  maskedPhone: z.string().regex(MASKED_PHONE_RE),
  accountIds: z.array(accountId),
  monthlyFlows: z.array(so({ month: z.string(), inflow: rupees, outflow: rupees })),
  counterpartyCount: z.number().int().nonnegative(),
  explanation: so({ text: z.string(), documents: z.array(z.string()) }).nullable(),
  profileEdit: so({ by: employeeId, at: iso, field: z.string(), alertId }).nullable(),
});

export const Account = so({
  id: accountId,
  customerId: customerId.nullable(),
  type: z.enum(['Savings', 'Current', 'Fixed Deposit', 'External']),
  balance: rupees,
  openedAt: iso,
  dormant: z.boolean(),
});

// ---------- scenario building blocks ----------
export const Transaction = so({
  id: z.string().regex(TXN_ID_RE),
  from: z.string(),
  to: z.string(),
  amount: rupees,
  at: iso,
  kind: z.enum(['FD_CLOSURE', 'TRANSFER', 'PAYROLL', 'SWEEP', 'DEPOSIT']),
  outcome: z.enum(['EXECUTED', 'BLOCKED']),
  cycle: z.boolean(),
});

export const TimelineEntry = so({
  id: z.string(),
  at: iso,
  category: TimelineCategory,
  title: z.string(),
  detail: z.string(),
  uncertaintySec: z.number().int().nonnegative().optional(),
  gap: z.boolean().optional(),
  actorId: employeeId.optional(),
  txnId: z.string().regex(TXN_ID_RE).optional(),
});

export const ControlRow = so({
  id: z.string(),
  name: z.string(),
  outcome: z.enum(['PASS', 'FAIL']),
  integrity: ControlIntegrity,
  reason: z.string(),
  writerEventId: z.string().nullable(),
  writerGrade: AuthGrade.nullable(),
});

export const EvidenceSummaryItem = so({
  key: z.string(),
  label: z.string(),
  status: EvidenceStatus,
  detail: z.string(),
});

export const EvidenceDocument = so({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['JSON', 'CSV', 'TXT']),
  generator: z.string(),
});

export const GraphNode = so({
  id: z.string(),
  kind: z.enum(['customer', 'account', 'employee', 'beneficiary']),
  label: z.string(),
  sub: z.string().optional(),
  balance: rupees.optional(),
  x: z.number(),
  y: z.number(),
});

export const Connection = so({
  credential: employeeId,
  type: ConnectionType,
  strength: z.enum(['STRONGEST', 'STRONG', 'MEDIUM', 'CONTEXT']),
  targetNodeId: z.string(),
  evidence: z.string(),
});

export const PathStep = so({
  key: z.string(),
  label: z.string(),
  detail: z.string(),
  artifact: z.string(),
  grade: AuthGrade.nullable(),
  integrity: ControlIntegrity,
});

export const InsiderProfile = so({
  employeeId,
  signals: z.array(SignalId),
  attribution: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  attributionNote: z.string(),
  staffWithSamePermission: z.number().int().nonnegative(),
  credentialMisuseIndicators: z.boolean(),
  attendanceAvailable: z.boolean(),
  actions: z.array(so({
    at: iso, action: z.string(), account: z.string(),
    permitted: z.boolean(), inPortfolio: z.boolean(), evidenceGrade: AuthGrade,
  })),
});

export const ReplayCandidate = so({
  id: z.string(),
  label: z.string(),
  eventId: z.string(),
  declaredRole: DependencyRole.nullable(),
  role: DependencyRole,
  dependents: z.array(z.string()),
});

export const ReplayVariant = so({
  removed: z.array(z.string()),
  outcome: z.enum(['PASS', 'FAIL']),
  cascadeEventIds: z.array(z.string()),
});

export const Replay = so({
  targetLabel: z.string(),
  candidates: z.array(ReplayCandidate),
  disablingSets: z.array(z.array(z.string())),
  coverage: so({ modelled: z.number().int(), applicable: z.number().int(), status: z.enum(['FULL', 'PARTIAL']) }),
  steps: z.array(so({ title: z.string(), detail: z.string() })),
  variants: z.array(ReplayVariant),
  pathEventIds: z.array(z.string()),
});

export const ReachEntry = so({
  accountId: z.string(),
  label: z.string(),
  predicates: z.array(so({ text: z.string(), holds: z.boolean() })),
  status: z.enum(['EXPOSED', 'NEAR']),
  exposure: rupees,
  writers: z.array(employeeId),
});

export const Scenario = so({
  id: z.string(),
  alertId: alertId.nullable(),
  kind: ScenarioKind,
  twinOf: z.string().nullable(),
  level: AlertLevel,
  title: z.string(),
  customerId: customerId.nullable(),
  nodes: z.array(GraphNode),
  transactions: z.array(Transaction),
  timeline: z.array(TimelineEntry),
  controls: z.array(ControlRow),
  evidenceSummary: z.array(EvidenceSummaryItem),
  documents: z.array(EvidenceDocument),
  connections: z.array(Connection),
  pathSteps: z.array(PathStep),
  insiders: z.array(InsiderProfile),
  replay: Replay.nullable(),
  reach: z.array(ReachEntry),
  employeeIds: z.array(employeeId),
  beneficiaryIds: z.array(z.string()),
  customerIds: z.array(customerId),
  explanation: z.string().nullable(),
  divergenceNote: z.string().nullable(),
});

// ---------- alerts / cases ----------
export const RiskIndicator = so({ text: z.string(), severity: z.enum(['high', 'medium']) });

export const ListFacts = so({
  amountAtRisk: rupees,
  accountsCount: z.number().int().nonnegative(),
  employeesCount: z.number().int().nonnegative(),
  customersCount: z.number().int().nonnegative(),
  beneficiariesCount: z.number().int().nonnegative(),
  transactionsCount: z.number().int().nonnegative(),
  firstTxnAt: iso,
  lastTxnAt: iso,
});

export const EntityRefs = so({
  accountIds: z.array(z.string()),
  employeeIds: z.array(employeeId),
  customerIds: z.array(customerId),
  beneficiaryIds: z.array(z.string()),
});

export const Alert = so({
  id: alertId,
  title: z.string(),
  level: AlertLevel,
  type: AlertType,
  status: AlertStatus,
  createdAt: iso,
  closedAt: iso.nullable(),
  assignedTo: z.string().nullable(),
  summary: z.string(),
  reasons: z.array(z.string()).min(1),
  riskIndicators: z.array(RiskIndicator),
  evidenceConfidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']),
  detailLevel: DetailLevel,
  scenarioId: z.string().optional(),
  entityRefs: EntityRefs,
  listFacts: ListFacts,
  evidenceSummary: z.array(EvidenceSummaryItem).min(1),
});

export const Case = so({
  id: z.string().regex(CASE_ID_RE),
  alertId,
  title: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: AlertStatus,
  assignedTo: z.string().nullable(),
  createdAt: iso,
  decision: so({ type: DecisionType, rationale: z.string().min(1), at: iso, by: z.string() }).nullable(),
});

export const Note = so({
  id: z.string(),
  alertId,
  author: z.string(),
  at: iso,
  text: z.string().min(1).max(5000),
});

// ---------- metrics ----------
export const MetricsFile = so({
  status: z.enum(['PENDING_EVALUATION', 'MEASURED']),
  definitions: z.array(so({ id: z.string(), name: z.string(), description: z.string() })),
  baselines: z.array(so({ id: z.string(), name: z.string(), description: z.string() })),
  ablations: z.array(so({ id: z.string(), name: z.string() })),
  values: z.record(z.string(), z.number()).optional(),
}).refine((m) => !(m.status === 'PENDING_EVALUATION' && m.values !== undefined), {
  message: 'Pending evaluation must not carry values',
});

// ---------- core file ----------
export const ScenarioIndexEntry = so({
  id: z.string(),
  alertId: alertId.nullable(),
  title: z.string(),
  kind: ScenarioKind,
  file: z.string(),
});

export const CoreFile = so({
  meta: so({ asOf: iso, windowStart: iso, windowEnd: iso, seed: z.number().int() }),
  users: z.array(User),
  employees: z.array(Employee),
  customers: z.array(Customer),
  accounts: z.array(Account),
  alerts: z.array(Alert),
  cases: z.array(Case),
  scenarios: z.array(ScenarioIndexEntry),
});

/** Name → schema, used by the shared sample manifest (data/contract-samples/manifest.json). */
export const SCHEMAS = {
  Alert, Case, Note, User, Employee, Customer, Account, Transaction, TimelineEntry, ControlRow,
  EvidenceSummaryItem, EvidenceDocument, ReplayVariant, ReachEntry, MetricsFile, Scenario, CoreFile,
} as const;

export type UserT = z.infer<typeof User>;
export type EmployeeT = z.infer<typeof Employee>;
export type CustomerT = z.infer<typeof Customer>;
export type AccountT = z.infer<typeof Account>;
export type TransactionT = z.infer<typeof Transaction>;
export type TimelineEntryT = z.infer<typeof TimelineEntry>;
export type ControlRowT = z.infer<typeof ControlRow>;
export type EvidenceSummaryItemT = z.infer<typeof EvidenceSummaryItem>;
export type EvidenceDocumentT = z.infer<typeof EvidenceDocument>;
export type GraphNodeT = z.infer<typeof GraphNode>;
export type ConnectionT = z.infer<typeof Connection>;
export type PathStepT = z.infer<typeof PathStep>;
export type InsiderProfileT = z.infer<typeof InsiderProfile>;
export type ReplayT = z.infer<typeof Replay>;
export type ReplayVariantT = z.infer<typeof ReplayVariant>;
export type ReplayCandidateT = z.infer<typeof ReplayCandidate>;
export type ReachEntryT = z.infer<typeof ReachEntry>;
export type ScenarioT = z.infer<typeof Scenario>;
export type AlertT = z.infer<typeof Alert>;
export type CaseT = z.infer<typeof Case>;
export type NoteT = z.infer<typeof Note>;
export type MetricsFileT = z.infer<typeof MetricsFile>;
export type CoreFileT = z.infer<typeof CoreFile>;
export type ScenarioIndexEntryT = z.infer<typeof ScenarioIndexEntry>;
export type ListFactsT = z.infer<typeof ListFacts>;
export type DecisionTypeT = z.infer<typeof DecisionType>;
export type SignalIdT = z.infer<typeof SignalId>;
export type AuthGradeT = z.infer<typeof AuthGrade>;
