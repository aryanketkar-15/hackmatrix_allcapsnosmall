"""KHOJI data contract v2 (pydantic). Mirror of frontend/src/types/contract.ts.

Every model forbids extra keys, so a stray numeric ``riskScore`` is rejected.
"""
from __future__ import annotations

from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictInt, StringConstraints, model_validator

AlertLevel = Literal["HIGH", "MEDIUM", "WATCH", "NEAR_MISS", "DATA_GAP", "INFO"]
AlertType = Literal[
    "CIRCULAR_TRANSFER", "STRUCTURING", "FAN_OUT", "FAN_IN", "PASS_THROUGH",
    "BENEFICIARY_MANIPULATION", "DORMANT_ACTIVATION", "PROFILE_MISMATCH", "INSIDER_ACTIVITY",
]
AlertStatus = Literal["NEW", "UNDER_REVIEW", "ASSIGNED", "INVESTIGATING", "PENDING_EVIDENCE", "DECIDED", "CLOSED"]
ConnectionType = Literal["STATE_DEPENDENCY", "APPROVAL", "ONBOARDING", "PROFILE_EDIT", "INFRASTRUCTURE"]
DependencyRole = Literal["NECESSARY", "JOINTLY_NECESSARY", "CONTRIBUTORY", "CONCEALING", "IRRELEVANT"]
AuthGrade = Literal["A", "B", "C", "D", "E", "X", "U"]
ControlIntegrity = Literal["GENUINE", "HOLLOW", "UNKNOWN"]
TimelineCategory = Literal["EMPLOYEE_ACTIVITY", "ACCOUNT_STATE_CHANGE", "CONTROL_CHECK", "TRANSACTION"]
EvidenceStatus = Literal["FOUND", "NOT_FOUND", "MISSING", "TAINTED", "AVAILABLE", "NOT_AVAILABLE"]
DetailLevel = Literal["FULL", "SUMMARY"]
SignalId = Literal["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]
DecisionType = Literal[
    "INSIDER_CONNECTED", "EXTERNAL_FRAUD", "CUSTOMER_DISPUTE", "PROCESS_VIOLATION", "FALSE_POSITIVE", "INCONCLUSIVE",
]
ScenarioKind = Literal["ATTACK", "TWIN", "SWEEP", "GAP", "NEAR_MISS"]

Iso = Annotated[str, StringConstraints(pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$")]
Rupees = Annotated[int, Field(ge=0, strict=True)]
AlertId = Annotated[str, StringConstraints(pattern=r"^ALT-\d{4}-\d{3}$")]
CaseId = Annotated[str, StringConstraints(pattern=r"^CASE-\d{3}$")]
EmployeeId = Annotated[str, StringConstraints(pattern=r"^E\d{2,3}$")]
CustomerId = Annotated[str, StringConstraints(pattern=r"^C\d{3}$")]
AccountId = Annotated[str, StringConstraints(pattern=r"^[A-Z]-\d{3}$")]
TxnId = Annotated[str, StringConstraints(pattern=r"^T\d+$")]
MaskedPhone = Annotated[str, StringConstraints(pattern=r"^•{6}\d{3}$")]


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class User(Strict):
    id: Annotated[str, StringConstraints(pattern=r"^U\d+$")]
    username: str
    name: str
    role: str
    initials: Annotated[str, StringConstraints(min_length=1, max_length=3)]


class Permission(Strict):
    name: str
    held: StrictBool


class Activity(Strict):
    at: Iso
    action: str
    account: str
    channel: str
    location: str


class Behaviour(Strict):
    unusualTime: str
    outsidePortfolio: str
    highRisk: str
    overall: Literal["Low", "Medium", "High"]


class Employee(Strict):
    id: EmployeeId
    name: str
    initials: Annotated[str, StringConstraints(min_length=1, max_length=3)]
    role: str
    branch: str
    department: str
    status: Literal["Active", "On leave", "Inactive"]
    portfolio: str
    permissions: list[Permission]
    activities: list[Activity]
    behaviour: Behaviour
    signalCount: Annotated[int, Field(ge=0, strict=True)]


class MonthlyFlow(Strict):
    month: str
    inflow: Rupees
    outflow: Rupees


class Explanation(Strict):
    text: str
    documents: list[str]


class ProfileEdit(Strict):
    by: EmployeeId
    at: Iso
    field: str
    alertId: AlertId


class Customer(Strict):
    id: CustomerId
    name: str
    initials: Annotated[str, StringConstraints(min_length=1, max_length=3)]
    type: Literal["Individual", "Business"]
    kycRisk: Literal["Low", "Medium", "High"]
    verified: StrictBool
    age: Annotated[int, Field(ge=0, strict=True)]
    occupation: str
    annualIncome: Rupees
    location: str
    maskedPhone: MaskedPhone
    accountIds: list[AccountId]
    monthlyFlows: list[MonthlyFlow]
    counterpartyCount: Annotated[int, Field(ge=0, strict=True)]
    explanation: Optional[Explanation]
    profileEdit: Optional[ProfileEdit]


class Account(Strict):
    id: AccountId
    customerId: Optional[CustomerId]
    type: Literal["Savings", "Current", "Fixed Deposit", "External"]
    balance: Rupees
    openedAt: Iso
    dormant: StrictBool


class Transaction(Strict):
    id: TxnId
    # "from" is a Python keyword; alias keeps the wire name identical to the TS contract.
    from_: str = Field(alias="from")
    to: str
    amount: Rupees
    at: Iso
    kind: Literal["FD_CLOSURE", "TRANSFER", "PAYROLL", "SWEEP", "DEPOSIT"]
    outcome: Literal["EXECUTED", "BLOCKED"]
    cycle: StrictBool

    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class TimelineEntry(Strict):
    id: str
    at: Iso
    category: TimelineCategory
    title: str
    detail: str
    uncertaintySec: Optional[Annotated[int, Field(ge=0, strict=True)]] = None
    gap: Optional[StrictBool] = None
    actorId: Optional[EmployeeId] = None
    txnId: Optional[TxnId] = None


class ControlRow(Strict):
    id: str
    name: str
    outcome: Literal["PASS", "FAIL"]
    integrity: ControlIntegrity
    reason: str
    writerEventId: Optional[str]
    writerGrade: Optional[AuthGrade]


class EvidenceSummaryItem(Strict):
    key: str
    label: str
    status: EvidenceStatus
    detail: str


class EvidenceDocument(Strict):
    id: str
    name: str
    kind: Literal["JSON", "CSV", "TXT"]
    generator: str


class GraphNode(Strict):
    id: str
    kind: Literal["customer", "account", "employee", "beneficiary"]
    label: str
    sub: Optional[str] = None
    balance: Optional[Rupees] = None
    x: float
    y: float


class Connection(Strict):
    credential: EmployeeId
    type: ConnectionType
    strength: Literal["STRONGEST", "STRONG", "MEDIUM", "CONTEXT"]
    targetNodeId: str
    evidence: str


class PathStep(Strict):
    key: str
    label: str
    detail: str
    artifact: str
    grade: Optional[AuthGrade]
    integrity: ControlIntegrity


class InsiderAction(Strict):
    at: Iso
    action: str
    account: str
    permitted: StrictBool
    inPortfolio: StrictBool
    evidenceGrade: AuthGrade


class InsiderProfile(Strict):
    employeeId: EmployeeId
    signals: list[SignalId]
    attribution: Literal["HIGH", "MEDIUM", "LOW"]
    attributionNote: str
    staffWithSamePermission: Annotated[int, Field(ge=0, strict=True)]
    credentialMisuseIndicators: StrictBool
    attendanceAvailable: StrictBool
    actions: list[InsiderAction]


class ReplayCandidate(Strict):
    id: str
    label: str
    eventId: str
    declaredRole: Optional[DependencyRole]
    role: DependencyRole
    dependents: list[str]


class ReplayVariant(Strict):
    removed: list[str]
    outcome: Literal["PASS", "FAIL"]
    cascadeEventIds: list[str]


class Coverage(Strict):
    modelled: Annotated[int, Field(strict=True)]
    applicable: Annotated[int, Field(strict=True)]
    status: Literal["FULL", "PARTIAL"]


class ReplayStep(Strict):
    title: str
    detail: str


class Replay(Strict):
    targetLabel: str
    candidates: list[ReplayCandidate]
    disablingSets: list[list[str]]
    coverage: Coverage
    steps: list[ReplayStep]
    variants: list[ReplayVariant]
    pathEventIds: list[str]


class Predicate(Strict):
    text: str
    holds: StrictBool


class ReachEntry(Strict):
    accountId: str
    label: str
    predicates: list[Predicate]
    status: Literal["EXPOSED", "NEAR"]
    exposure: Rupees
    writers: list[EmployeeId]


class Scenario(Strict):
    id: str
    alertId: Optional[AlertId]
    kind: ScenarioKind
    twinOf: Optional[str]
    level: AlertLevel
    title: str
    customerId: Optional[CustomerId]
    victimAccountIds: list[str]
    nodes: list[GraphNode]
    transactions: list[Transaction]
    timeline: list[TimelineEntry]
    controls: list[ControlRow]
    evidenceSummary: list[EvidenceSummaryItem]
    documents: list[EvidenceDocument]
    connections: list[Connection]
    pathSteps: list[PathStep]
    insiders: list[InsiderProfile]
    replay: Optional[Replay]
    reach: list[ReachEntry]
    employeeIds: list[EmployeeId]
    beneficiaryIds: list[str]
    customerIds: list[CustomerId]
    explanation: Optional[str]
    divergenceNote: Optional[str]


class RiskIndicator(Strict):
    text: str
    severity: Literal["high", "medium"]


class ListFacts(Strict):
    amountAtRisk: Rupees
    accountsCount: Annotated[int, Field(ge=0, strict=True)]
    employeesCount: Annotated[int, Field(ge=0, strict=True)]
    customersCount: Annotated[int, Field(ge=0, strict=True)]
    beneficiariesCount: Annotated[int, Field(ge=0, strict=True)]
    transactionsCount: Annotated[int, Field(ge=0, strict=True)]
    firstTxnAt: Iso
    lastTxnAt: Iso


class EntityRefs(Strict):
    accountIds: list[str]
    employeeIds: list[EmployeeId]
    customerIds: list[CustomerId]
    beneficiaryIds: list[str]


class Alert(Strict):
    id: AlertId
    title: str
    level: AlertLevel
    type: AlertType
    status: AlertStatus
    createdAt: Iso
    closedAt: Optional[Iso]
    assignedTo: Optional[str]
    summary: str
    reasons: Annotated[list[str], Field(min_length=1)]
    riskIndicators: list[RiskIndicator]
    evidenceConfidence: Literal["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]
    detailLevel: DetailLevel
    scenarioId: Optional[str] = None
    entityRefs: EntityRefs
    listFacts: ListFacts
    evidenceSummary: Annotated[list[EvidenceSummaryItem], Field(min_length=1)]


class Decision(Strict):
    type: DecisionType
    rationale: Annotated[str, StringConstraints(min_length=1)]
    at: Iso
    by: str


class Case(Strict):
    id: CaseId
    alertId: AlertId
    title: str
    priority: Literal["High", "Medium", "Low"]
    status: AlertStatus
    assignedTo: Optional[str]
    createdAt: Iso
    decision: Optional[Decision]


class Note(Strict):
    id: str
    alertId: AlertId
    author: str
    at: Iso
    text: Annotated[str, StringConstraints(min_length=1, max_length=5000)]


class MetricDef(Strict):
    id: str
    name: str
    description: str


class Ablation(Strict):
    id: str
    name: str


class MetricsFile(Strict):
    status: Literal["PENDING_EVALUATION", "MEASURED"]
    definitions: list[MetricDef]
    baselines: list[MetricDef]
    ablations: list[Ablation]
    values: Optional[dict[str, float]] = None

    @model_validator(mode="after")
    def _pending_has_no_values(self) -> "MetricsFile":
        if self.status == "PENDING_EVALUATION" and self.values is not None:
            raise ValueError("Pending evaluation must not carry values")
        return self


class ScenarioIndexEntry(Strict):
    id: str
    alertId: Optional[AlertId]
    title: str
    kind: ScenarioKind
    file: str


class Meta(Strict):
    asOf: Iso
    windowStart: Iso
    windowEnd: Iso
    seed: Annotated[int, Field(strict=True)]


class CoreFile(Strict):
    meta: Meta
    users: list[User]
    employees: list[Employee]
    customers: list[Customer]
    accounts: list[Account]
    alerts: list[Alert]
    cases: list[Case]
    scenarios: list[ScenarioIndexEntry]


SCHEMAS: dict[str, type[BaseModel]] = {
    "Alert": Alert, "Case": Case, "Note": Note, "User": User, "Employee": Employee, "Customer": Customer,
    "Account": Account, "Transaction": Transaction, "TimelineEntry": TimelineEntry, "ControlRow": ControlRow,
    "EvidenceSummaryItem": EvidenceSummaryItem, "EvidenceDocument": EvidenceDocument,
    "ReplayVariant": ReplayVariant, "ReachEntry": ReachEntry, "MetricsFile": MetricsFile,
    "Scenario": Scenario, "CoreFile": CoreFile,
}
