# KHOJI Data Contract v2

Single shape shared by fixtures, frontend (`frontend/src/types/contract.ts`, zod) and backend
(`backend/app/models.py`, pydantic). Both sides are **strict**: unknown keys are rejected. Shared samples in
`data/contract-samples/` (with `manifest.json`) are validated by both test suites (parity test).

## Rules
1. **No numeric risk score.** Alerts carry a level (`HIGH…INFO`), non-empty `reasons`, and an evidence summary. `riskScore` is rejected structurally (deviation C2).
2. **Masked phones only** (`••••••210`).
3. **Derived values.** Amount at risk, counts and first/last transaction for FULL alerts are derived from the scenario's transactions. `listFacts` exists for list display and is checked equal to the derived values by tests.
4. **Metrics honesty.** `PENDING_EVALUATION` must not carry `values`.
5. Amounts are whole rupees (integers); timestamps are ISO-8601 with offset (IST).

## Enums
`AlertLevel` HIGH · MEDIUM · WATCH · NEAR_MISS · DATA_GAP (shown "Inconclusive") · INFO (shown "Explained")
`AlertType` CIRCULAR_TRANSFER · STRUCTURING · FAN_OUT · FAN_IN · PASS_THROUGH · BENEFICIARY_MANIPULATION · DORMANT_ACTIVATION · PROFILE_MISMATCH · INSIDER_ACTIVITY
`AlertStatus` NEW → UNDER_REVIEW → ASSIGNED → INVESTIGATING ⇄ PENDING_EVIDENCE → DECIDED → CLOSED
`ConnectionType` STATE_DEPENDENCY · APPROVAL · ONBOARDING · PROFILE_EDIT · INFRASTRUCTURE
`DependencyRole` NECESSARY · JOINTLY_NECESSARY · CONTRIBUTORY · CONCEALING · IRRELEVANT
`AuthGrade` A–E, X (inconsistent/forged-looking), U (source unavailable)
`ControlIntegrity` GENUINE · HOLLOW · UNKNOWN
`TimelineCategory` EMPLOYEE_ACTIVITY · ACCOUNT_STATE_CHANGE · CONTROL_CHECK · TRANSACTION
`EvidenceStatus` FOUND · NOT_FOUND · MISSING · TAINTED · AVAILABLE · NOT_AVAILABLE
`DetailLevel` FULL · SUMMARY

## Entities
User, Employee, Customer, Account, Transaction, TimelineEntry, ControlRow, EvidenceSummaryItem, EvidenceDocument
(generator reference, not a file), GraphNode, Connection, PathStep, InsiderProfile, Replay (+ candidates, variants),
ReachEntry, Scenario, Alert, Case, Note, MetricsFile, CoreFile.

## Files served
- `core.json` — users, employees, customers, accounts, 124 alerts, cases, scenario index
- `scenarios/<id>.json` — full reconstruction for FULL alerts (+ the S1 twin)
- `metrics.json` — evaluation definitions/baselines/ablations, status `PENDING_EVALUATION`
