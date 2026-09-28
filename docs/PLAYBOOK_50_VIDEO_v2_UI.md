# KHOJI · FIN-04 — Development Playbook v2 (UI-aligned)

**Project:** KHOJI — Financial Crime & Insider Risk Intelligence Platform (HackMatrix 5.0 · FIN-04)
**Covers:** the first 50% of the build: a frontend-first, scripted-data prototype that matches your 13-screen UI mockup and ends in a recorded video.
**Machine:** one laptop (Aryan's). Commits are attributed to whoever wrote the work.
**Date:** 29 September 2026
**Relationship to v1 (`PLAYBOOK_50_VIDEO.md`):** v2 replaces v1 Phases 1–7. Phase 0 (M0.1–M0.3), the identity aliases and the rollback codes are unchanged. Keep v1 for the exact Phase 0 commands.

---

## 0. How to Apply v2

| Your situation | What to do |
|---|---|
| Nothing built yet | Follow v2 from Phase 0 (same as v1), then Phases 1–8 here |
| Phase 0 done | Keep it. Discard any v1 Phase 1+ work. The data contract changed, so fixtures must be regenerated |
| Some v1 Phase 1–2 done | Keep the repo and tooling. Redo M1.1 onward, because the contract, theme and routes all changed |

Save the mockup image as `docs/design/khoji-ui-mockup.png` (committed in M2.1).

---

## 1. What Changed and Why

| Area | v1 | v2 (mockup-driven) |
|---|---|---|
| Theme | Dark | **Light** (white cards, blue primary). Your mockup is light, so v2 follows it |
| Entry point | Alert queue | **Login → Dashboard** |
| Navigation | 4 items | **10 items** (Dashboard, Alerts, Investigations, Transactions, Customers, Employees, Graph Explorer, Analytics, Reports, Settings) + global search, bell, user menu |
| Alert detail | One page with stacked panels | **7 tabs:** Overview · Transaction Graph · Timeline · Employee Activity · Evidence · But-for Analysis · Notes |
| Timeline | Horizontal 4-lane SVG | **Vertical tagged list** (as in mockup) |
| Where the innovations live | Panels on one page | Hollow Pass → **Evidence** tab · Access rights → **Employee Activity** tab · Remove/Twin/Reach → **But-for Analysis** tab · Scoreboard → **Analytics › Evaluation** tab |
| Data | ~10 scenarios | ~10 full scenarios **+ 124 seed alerts, cases, employees, customers** |
| New screens | — | Login, Dashboard, Customer Profile, Analytics, Reports (+ Employees, Transactions, Graph Explorer, Settings as SHOULD) |
| New dependencies | — | `@fontsource/inter` (2.1), `recharts` (3.2) |
| Case states | TRIAGED, PENDING_INFO | Renamed to match mockup labels: **UNDER_REVIEW, PENDING_EVIDENCE** |

---

## 2. Mockup Analysis

### 2.1 Screen → Route → Milestone

| # | Mockup screen | Route | Milestone |
|---|---|---|---|
| 1 | Login | `/login` | 2.3 |
| 2 | Dashboard (Overview) | `/dashboard` | 3.1, 3.2 |
| 3 | Alerts List | `/alerts` | 3.3 |
| 4 | Alert Investigation (Overview tab) | `/alerts/:id/overview` | 4.1 |
| 5 | Transaction Graph | `/alerts/:id/graph` | 4.2 |
| 6 | Timeline | `/alerts/:id/timeline` | 4.3 |
| 7 | Employee Activity | `/alerts/:id/employee` | 4.4 |
| 8 | Evidence & Authorization | `/alerts/:id/evidence` | 4.5 |
| 9 | But-for Analysis | `/alerts/:id/but-for` | 4.6, 4.7, 4.8 |
| 10 | Case Management ("Investigations" nav) | `/cases` | 5.1 |
| 11 | Customer Profile | `/customers/:id` | 5.2 |
| 12 | Analytics & Reports (charts) | `/analytics` | 5.3 |
| 13 | Reports & Export | `/reports` | 5.4 |
| — | Notes tab (not shown in mockup) | `/alerts/:id/notes` | 5.1 |
| — | In nav but not shown: Transactions, Employees, Graph Explorer, Settings | `/transactions` `/employees` `/graph-explorer` `/settings` | Phase 6 (SHOULD) |

### 2.2 Global Elements

* **Sidebar:** logo, 10 items with icons, blue active pill.
* **Top bar:** search ("Search for accounts, transactions, employees, customers…"), notification bell, user chip (name + role).
* **Prototype badge** (required by our honesty rules, not in the mockup): "Prototype · scripted scenario data", always visible in the top bar and on the login page.
* **Avatars:** the mockup uses face photos. We use **initials avatars** (no photos, so no licensing or privacy issue).

### 2.3 Design Tokens (approximate: confirm with an eyedropper on the mockup)

| Token | Default | Use |
|---|---|---|
| `primary` | `#2563EB` | Buttons, active nav, links |
| `page` | `#F4F6FA` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `border` | `#E5E7EB` | Card/table borders |
| `text` / `muted` | `#111827` / `#6B7280` | Body / secondary |
| `risk-high` | `#DC2626` | High |
| `risk-medium` | `#EA580C` | Medium |
| `risk-watch` | `#CA8A04` | Watch |
| `risk-inconclusive` | `#6B7280` | Inconclusive (DATA_GAP) |
| `risk-nearmiss` | `#7C3AED` | Near-miss |
| `risk-explained` | `#16A34A` | Explained (INFO) |
| Font | Inter | Typography (assumed from the mockup's look) |

### 2.4 Conflicts Between the Mockup and KHOJI's Principles: Decisions

| # | Mockup shows | Issue | Decision (logged in `docs/design/DEVIATIONS.md`) |
|---|---|---|---|
| C1 | Light theme | v1 was dark | Follow the mockup (light) |
| C2 | **"Risk Score 92/100"** in Alert Summary | The PS demands explainable risk levels, **not an opaque single score** | **Remove the number.** Show Risk Level chip + top reasons. Contract rejects any `riskScore` field |
| C3 | Login footer says "**Secure**" | The prototype has no real security | Change to "Evidence-backed · Explainable · Investigator-Focused" |
| C4 | Whole attack in ~40 minutes on one morning | Contradicts our cooldown discussion (banks delay changes) | Keep the mockup times. **Add a CONTROL_CHECK event: "Cooldown overridden at branch by credential E17, no independent checker".** Labelled a scenario assumption |
| C5 | Header ₹29,80,000, graph edges ~₹9 lakh, timeline ~₹29 lakh | Numbers are inconsistent | Fixtures are the single source of truth. Every displayed amount is **derived from the transactions** (worked example in M1.2) |
| C6 | Dashboard KPIs (124, 28, 46, 32), "% from last week" | Would be invented figures | Values come from the **seed data** and are computed. Week-on-week deltas are computed from seed dates or hidden. Narration must say the seed data is scripted |
| C7 | Levels: High / Medium / Watch / Inconclusive | Our taxonomy also has **Near-miss** and **Explained** (the legitimate twins) | Add both as extra tabs and legend items. DATA_GAP is displayed as "Inconclusive" |
| C8 | "NECESSARY" with a **green** check | Green reads as "safe" | Use blue/indigo for dependency roles. Green stays for "genuine/passed" |
| C9 | Timeline tags: Employee Activity, Account State Change, Transaction | No place for controls | Add a 4th tag, **Control Check** (shows the Hollow Pass) |
| C10 | Evidence documents as PDFs with sizes (1.2 MB…) | Fake sizes and files | Generate **real files** client-side (JSON/CSV/TXT) and show the **real** byte size |
| C11 | Full phone numbers, photos, person names | Privacy and looks-like-real-people risk | Store **masked** numbers only (`••••••210`), initials avatars, clearly synthetic names |
| C12 | Case statuses: Open / Under Review / Pending Evidence / Closed | Different from our state machine | Unified enum: NEW → UNDER_REVIEW → ASSIGNED → INVESTIGATING ⇄ PENDING_EVIDENCE → DECIDED → CLOSED |
| C13 | No screen for Control Path, Twin, Reach, Scoreboard | Our innovations need a home | Control Path → Evidence tab. Twin + Reach → But-for tab (segmented control). Scoreboard → Analytics › Evaluation tab |
| C14 | Second button beside "Create Case" is unreadable (looks like "Dispute") | Unclear | Assumption: "Export CSV". **Confirm** |
| C15 | Analytics trend by month | Seed data spans 30 days | Weekly buckets computed from alerts |
| C16 | Hero photo of a bank building | Licensing | Inline SVG skyline illustration. No hotlinked images |
| C17 | Alert created 09:12, first transaction 09:12 | Detection cannot precede the pattern | Invariant: `alert.createdAt ≥ last transaction time` |

### 2.5 Contract Additions (implemented in M1.1)

Alert (type, status, assignee, summary, risk indicators, listFacts, detail level), User, Employee (activities, behavioural analysis, permissions, portfolio), Customer (declared profile, monthly flows, KYC risk rating), Account, Transaction, TimelineEntry (4 categories), ControlRow, EvidenceSummaryItem, EvidenceDocument (generator reference, not a file), Case, Note, ReplayVariant, ReachEntry, TwinStep, MetricsFile.

### 2.6 Seed Data Spec (design parameters, **not** measured results)

| Dimension | Values (total 124 alerts) |
|---|---|
| Level | HIGH 28 · MEDIUM 52 · WATCH 30 · DATA_GAP 8 · NEAR_MISS 3 · INFO 3 |
| Status | NEW 18 · UNDER_REVIEW 14 · ASSIGNED 12 · INVESTIGATING 38 · PENDING_EVIDENCE 8 · CLOSED 34 (32 closed within the last 7 days) |
| Type | CIRCULAR_TRANSFER 28 · STRUCTURING 24 · FAN_OUT 18 · FAN_IN 14 · PASS_THROUGH 12 · BENEFICIARY_MANIPULATION 10 · DORMANT_ACTIVATION 8 · PROFILE_MISMATCH 6 · INSIDER_ACTIVITY 4 |
| Derived KPIs | Total 124 · High 28 · Under Investigation = INVESTIGATING + PENDING_EVIDENCE = 46 · Closed this week 32 |
| Pagination | 124 ÷ 10 = 13 pages (last page 4 rows) |
| People | 3 investigators, 30 employees (E01–E30; hero **E17**, second involved **E22**), 40 customers (C001–C040; hero **C001**) |
| Cases | One per alert with status ASSIGNED or later (92) |
| Date window | 1–30 Apr 2024 (kept from the mockup). "As-of" time 30 Apr 2024 18:00 IST |
| Detail level | ~10 alerts are **FULL** (real scenarios, all tabs). The rest are **SUMMARY** (Overview, Evidence summary and Notes only) |

> **Assumption:** the Apr 2024 window is kept for visual parity. It is one constant, so shifting it is a one-line change.

### 2.7 New Missing Information (v1's list still applies)

| # | Question | Default assumed |
|---|---|---|
| 1 | Is the mockup the approved final design? Any exact colour/font spec? | Yes. Tokens sampled by eyedropper |
| 2 | Label of the second button on the Cases screen | "Export CSV" |
| 3 | Must Transactions / Employees / Graph Explorer / Settings appear in the video? | No. Built as SHOULD (Phase 6) |
| 4 | Demo login credentials | User `priya.sharma`, password `demo-only-123` (public, non-secret). Never reuse a real password |
| 5 | Keep Apr 2024 dates? | Yes |
| 6 | Is adding Recharts acceptable? | Yes (reason in M3.2) |
| 7 | Are the mockup's persona names acceptable as synthetic? | Yes |

---

## 3. Scope and Honesty Rules

### IN scope
Login, dashboard, alerts, tabbed investigation, cases, customers, analytics, reports, scripted seed data, client-side case workflow, hashed export, minimal FastAPI, demo mode, E2E, video.

### OUT of scope (second half)
Real simulator, detection engines, taint/authorization engine, real replay, Isolation Forest, measured evaluation, **real authentication and role-based access**.

### Honesty rules (mandatory)
1. Permanent badge: **"Prototype · scripted scenario data"**.
2. Remove and Reach results are **precomputed**. Narration says so.
3. Analytics › Evaluation shows **"Evaluation pending"**. No invented metric values anywhere.
4. Dashboard numbers come from scripted seed data. Say it in narration.
5. Language: "credential E17", "operational dependency". Never "culprit/guilty/fraudster". No intent claims.
6. Login is a **UI gate for the video only**, not security.

---

## 4. Team and Git Identities

| Member | Git name | Email | GitHub | Alias | Milestones (count) |
|---|---|---|---|---|---|
| Aryan Ketkar | Aryan Ketkar | aryanketkar02@gmail.com | aryanketkar-15 | `git commit-aryan` | 0.1 0.3 1.1 2.4 2.5 4.6 7.1 8.2 (8) |
| Rishi Agrawal | Rishi Agrawal | rishisagrawal02@gmail.com | rishiagrawal02 | `git commit-rishi` | 0.2 2.1 2.2 3.3 4.1 4.5 5.2 6.2 7.2 (9) |
| Chetan Agrawal | Chetan Agrawal | chetanagrawal721@gmail.com | chetanagrawal721 | `git commit-chetan` | 1.4 2.3 3.1 3.2 4.2 4.3 4.7 5.3 6.3 8.1 (10) |
| Shanteshwar Malang | Shanteshwar Malang | malangshanteshwar@gmail.com | shanteshwar-18 | `git commit-shanteshwar` | 1.2 1.3 4.4 4.8 5.1 5.4 6.1 (7) |

Owners are suggestions. Swap freely, but always commit under the alias of **who actually wrote it**. For pair work add `Co-authored-by: Name <email>` on its own line in the commit message. (Confirm Rishi's email spelling: the email has "rishisagrawal02", the username "rishiagrawal02".)

---

## 5. Repository Structure (target)

```text
khoji-fin04/
├─ README.md · CONTRIBUTORS.md · .gitignore · .editorconfig
├─ docs/
│  ├─ KHOJI_FIN04_Technical_Documentation.md · PLAYBOOK_50_VIDEO.md · PLAYBOOK_50_VIDEO_v2_UI.md
│  ├─ data-contract.md · demo-script.md
│  └─ design/ (khoji-ui-mockup.png · DEVIATIONS.md)
├─ data/
│  ├─ scenarios/ (s1..s5 YAML + twins) · seed.yaml · metrics.yaml
│  └─ contract-samples/
├─ scripts/ (setup-git-identities.sh · build_fixtures.py · build_seed.py · check.sh · check.ps1)
├─ frontend/
│  ├─ public/fixtures/ (core.json · scenarios/*.json · metrics.json)
│  ├─ src/
│  │  ├─ types/contract.ts
│  │  ├─ data/ (loader.ts · store.tsx · selectors.ts)
│  │  ├─ lib/ (format.ts · metrics.ts · hash.ts · stableStringify.ts · csv.ts · mask.ts)
│  │  ├─ components/ (ui · layout · dashboard · alerts · graph · timeline · employee · evidence
│  │  │               · replay · twin · reach · cases · customers · analytics · reports)
│  │  ├─ pages/ (Login · Dashboard · Alerts · AlertDetail · Cases · Customers · CustomerProfile
│  │  │          · Analytics · Reports · Employees · Transactions · GraphExplorer · Settings
│  │  │          · Styleguide · Demo · NotFound)
│  │  └─ auth/ (AuthContext.tsx · ProtectedRoute.tsx)
│  └─ e2e/
└─ backend/ (app/main.py · models.py · fixtures.py · tests/)
```

---

## 6. Standard Procedures (referenced by every milestone)

### 6.1 Git Checkpoint Template
Run **only after** every test passes and every verification item is ticked.

```bash
git switch main && git pull origin main && git switch -c feat/mX-Y-name   # at milestone START
# ... work ...
git status                                   # review the list first
git add .
git commit-<owner> -m "type(scope): summary [MX.Y]"
git log -1 --format="%an <%ae> | committer: %cn <%ce>"   # must show the owner
git push origin feat/mX-Y-name
# Aryan integrates:
git switch main && git merge --no-ff feat/mX-Y-name -m "merge: MX.Y name"
./scripts/check.sh            # or: powershell -File scripts/check.ps1
git push origin main
```

### 6.2 Never Commit
`node_modules/`, `.venv/`, `__pycache__/`, `frontend/dist/`, `coverage/`, `playwright-report/`, `test-results/`, `.env`, `.env.local`, secrets/tokens, `*.mp4`/`*.mov`, exported evidence packs/PDFs. **Exception:** generated fixtures in `frontend/public/fixtures/` are committed so the demo is reproducible.

### 6.3 Rollback Codes

| Code | Situation | Commands |
|---|---|---|
| **R-A** | Committed, not pushed | `git reset --soft HEAD~1` (keep) or `git reset --hard HEAD~1` (discard) |
| **R-B** | Pushed to branch, not merged | Fix forward, or `git revert <hash>` then push the branch |
| **R-C** | Merged to `main` | `git switch main` → `git revert -m 1 <merge-hash>` → run checks → `git push origin main`. **Never force-push main** |
| **R-D** | Need last good state fast | `git switch -c hotfix/restore <last-phase-tag>` → run checks |
| **R-E** | Wrong author on a pushed branch commit | On that branch only: `git -c user.name="…" -c user.email="…" commit --amend --reset-author --no-edit` → `git push --force-with-lease origin <branch>` |

### 6.4 Visual QA Procedure (VQ) — used by every UI milestone
1. Run at **1920×1080, 100% zoom**. Open `docs/design/khoji-ui-mockup.png` beside it.
2. Compare the mapped screen: region layout, typography hierarchy, colours, chip shapes, icons, spacing, **exact label text**, table columns.
3. Every difference is either fixed or logged in `docs/design/DEVIATIONS.md` (seed it from §2.4).
4. Also check at 1366×768: no horizontal scroll.

### 6.5 Test Status Legend
⬜ not run · ✅ pass · ❌ fail

---

## 7. Milestone Dependency Map

| Milestone | Owner | Requires |
|---|---|---|
| 0.1 Repo & identities | Aryan | — |
| 0.2 Frontend scaffold | Rishi | 0.1 |
| 0.3 Python tooling | Aryan | 0.1 |
| 1.1 Contract v2 | Aryan | 0.2, 0.3 |
| 1.2 Hero scenario S1 + twin | Shanteshwar | 1.1 |
| 1.3 Scenarios S2–S5 + metrics | Shanteshwar | 1.2 |
| 1.4 Seed data (124 alerts etc.) | Chetan | 1.2 |
| 2.1 Design system | Rishi | 0.2 |
| 2.2 App shell + routing | Rishi | 2.1 |
| 2.3 Login + demo auth | Chetan | 2.2 |
| 2.4 Data loader + store | Aryan | 1.4, 2.2 |
| 2.5 Global search + bell | Aryan | 2.4 |
| 3.1 Dashboard KPIs, recent, patterns | Chetan | 2.4 |
| 3.2 Dashboard charts | Chetan | 3.1 |
| 3.3 Alerts list | Rishi | 2.4 |
| 4.1 Alert detail shell + Overview | Rishi | 3.3 |
| 4.2 Transaction Graph tab | Chetan | 4.1 |
| 4.3 Timeline tab | Chetan | 4.1 |
| 4.4 Employee Activity tab | Shanteshwar | 4.1 |
| 4.5 Evidence tab | Rishi | 4.1, 4.3 |
| 4.6 But-for: Remove | Aryan | 4.3 |
| 4.7 But-for: Legitimate twin | Chetan | 4.5, 4.6 |
| 4.8 But-for: Reach | Shanteshwar | 4.6 |
| 5.1 Cases + Assign + Notes | Shanteshwar | 4.1, 2.4 |
| 5.2 Customers + Profile Analysis | Rishi | 4.1, 1.3 |
| 5.3 Analytics + Evaluation tab | Chetan | 3.2, 1.3 |
| 5.4 Reports & export | Shanteshwar | 5.1, 4.2–4.6 |
| 6.1 Employees pages (SHOULD) | Shanteshwar | 4.4 |
| 6.2 Transactions + Settings (SHOULD) | Rishi | 2.4 |
| 6.3 Graph Explorer (SHOULD) | Chetan | 4.2 |
| 7.1 FastAPI fixture API | Aryan | 0.3, 1.4 |
| 7.2 Frontend API mode + fallback | Rishi | 7.1, 2.4 |
| 8.1 Demo mode + E2E | Chetan | Phases 3–5 |
| 8.2 Video + release | Aryan (all four) | 8.1 |

**Parallel tracks after 2.4:** Chetan 3.1→3.2 · Rishi 3.3→4.1 · then Chetan 4.2/4.3, Shanteshwar 4.4, Rishi 4.5, Aryan 4.6.

---

# PHASE 0 — Project Setup & Baseline (unchanged from v1)

M0.1 (repo, `.gitignore`, four identity aliases, per-person commits), M0.2 (Vite React-TS + Tailwind v4 + router + lucide + zod + Vitest), M0.3 (Python venv, health API, `check.sh`/`check.ps1`). Use the v1 commands, tests and Git checkpoints exactly. Tag: `phase-0-done`.

---

# PHASE 1 — Data Contract & Fixtures

## M1.1 — Data Contract v2 (zod + pydantic)
**Owner:** Aryan · **Requires:** 0.2, 0.3

**1. Milestone Name** Shared data contract that covers every mockup screen.
**2. Objective** One validated shape for fixtures, frontend and backend. It enforces the "no single risk score" rule structurally.

**3. Tasks**
- [ ] Update `docs/data-contract.md` (entities below)
- [ ] zod schemas (`.strict()`) in `contract.ts`; pydantic mirrors (`extra="forbid"`) in `models.py`
- [ ] Enums: `AlertLevel` (+ display labels), `AlertType` (9 values from §2.6), `AlertStatus` (7), `ConnectionType`, `DependencyRole`, `AuthGrade` (A–E, X, U), `ControlIntegrity` (GENUINE/HOLLOW/UNKNOWN), `TimelineCategory` (EMPLOYEE_ACTIVITY, ACCOUNT_STATE_CHANGE, CONTROL_CHECK, TRANSACTION), `EvidenceStatus` (FOUND, NOT_FOUND, MISSING, TAINTED, AVAILABLE, NOT_AVAILABLE), `DetailLevel` (FULL, SUMMARY)
- [ ] Entities: User, Employee, Customer, Account, Transaction, TimelineEntry, ControlRow, EvidenceSummaryItem, EvidenceDocument, Alert, Case, Note, ReplayVariant, ReachEntry, TwinStep, MetricsFile
- [ ] **Derived-values rule:** amount at risk, counts, first/last transaction, KPI numbers are never stored for FULL alerts. `listFacts` is builder-computed for list display only
- [ ] ID regexes: `ALT-\d{4}-\d{3}`, `CASE-\d{3}`, `E\d{2,3}`, `C\d{3}`, `A-\d{3}`, `T\d+`
- [ ] Shared samples in `data/contract-samples/` (valid + invalid) used by **both** test suites

**4. Files** `docs/data-contract.md`, `frontend/src/types/contract.ts` (+ `.test.ts`), `backend/app/models.py`, `backend/tests/test_contract.py`, `data/contract-samples/*.json`

**5. Guidance**
```ts
export const LEVEL_LABEL = { HIGH:'High', MEDIUM:'Medium', WATCH:'Watch',
  NEAR_MISS:'Near-miss', DATA_GAP:'Inconclusive', INFO:'Explained' } as const;
export const Alert = z.object({
  id: z.string().regex(/^ALT-\d{4}-\d{3}$/), title: z.string(),
  level: AlertLevel, type: AlertType, status: AlertStatus,
  createdAt: z.string().datetime({ offset: true }), assignedTo: z.string().nullable(),
  summary: z.string(), reasons: z.array(z.string()).min(1),          // explainable, never empty
  riskIndicators: z.array(z.object({ text: z.string(), severity: z.enum(['high','medium']) })),
  evidenceConfidence: z.enum(['HIGH','MEDIUM','LOW','INSUFFICIENT']),
  detailLevel: z.enum(['FULL','SUMMARY']), scenarioId: z.string().optional(),
  entityRefs: EntityRefs, listFacts: ListFacts, evidenceSummary: z.array(EvidenceSummaryItem),
}).strict();   // strict() rejects a stray riskScore
```
Phones are stored **masked** only.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T1.1-01 | Valid sample, TS | Samples exist | Vitest validates `valid_minimal.json` | Parses | ⬜ |
| T1.1-02 | Valid sample, Python | — | pytest validates same file | Parses | ⬜ |
| T1.1-03 | Invalid enum | `level:"CRITICAL"` | Validate both | Rejected by both | ⬜ |
| T1.1-04 | **Numeric risk score** | Sample has `riskScore: 92` | Validate both | Rejected (PS: no opaque score) | ⬜ |
| T1.1-05 | Empty reasons | `reasons: []` | Validate | Rejected | ⬜ |
| T1.1-06 | Bad ID | `ALT-24-1` | Validate | Rejected | ⬜ |
| T1.1-07 | Unmasked phone | 10-digit number in a masked field | Validate | Rejected (regex for masked form) | ⬜ |
| T1.1-08 | Parity | — | Both suites loop over all samples | Same accept/reject per file | ⬜ |
| T1.1-09 | Metrics pending with values | `status: PENDING_EVALUATION` + `values` | Validate | Rejected | ⬜ |

**7. Verification** - [ ] every enum in the doc exists on both sides · - [ ] parity test passes · - [ ] `data-contract.md` matches the code
**8. Completion** Both validators agree on all samples; `check.sh` green.
**9. Git**
```bash
git status
git add .
git commit-aryan -m "feat(contract): shared zod/pydantic contract v2 with parity tests [M1.1]"
git push origin feat/m1-1-contract-v2
```
**10. Rollback** R-B / R-C. Later contract changes require a full fixture and UI regression.

---

## M1.2 — Hero Scenario S1 (ALT-2024-001) + Legitimate Twin
**Owner:** Shanteshwar · **Requires:** 1.1

**1. Milestone Name** Author S1 (matches mockup screens 4–9) and its lost-phone twin.
**2. Objective** The hero story has complete, consistent, validated data.

**3. Tasks**
- [ ] `data/scenarios/s1_takeover.yaml`, `s1t_recovery_twin.yaml` (all values are *scenario parameters*)
- [ ] Timeline, transactions, control rows, evidence summary (5 rows as mockup), documents list, replay variants, graph layout, E17 activity + signals
- [ ] `scripts/build_fixtures.py`: YAML → pydantic validation → deterministic JSON (`sort_keys`, fixed timestamps)
- [ ] Integrity/invariant tests (below)

**4. Files** `data/scenarios/*`, `scripts/build_fixtures.py`, `backend/tests/test_fixtures.py`, `frontend/public/fixtures/scenarios/s1*.json`

**5. Guidance: S1 authoring spec**

*Entities:* customer **C001**, account **A-001**, accounts **B-207**, **C-311**, external beneficiaries **X-901**, **X-902**; employees **E17** (contact change, beneficiary add) and **E22** (opened B-207 and C-311 on terminal T-2-04).

*Timeline (30 Apr 2024, IST):*

| Time | Category | Event |
|---|---|---|
| 08:55 | EMPLOYEE_ACTIVITY | E17 login, branch terminal |
| 09:02 | ACCOUNT_STATE_CHANGE | Mobile changed (`••••••210` → `••••••999`), ticket created **after** (09:03) → Grade X |
| 09:03 | CONTROL_CHECK | **Cooldown overridden at branch by credential E17, no independent checker** |
| 09:05 | ACCOUNT_STATE_CHANGE | Beneficiary "X Limited" `••1234` added |
| 09:07 | CONTROL_CHECK | MFA: OTP delivered to the **new** mobile, verified → PASS · HOLLOW |
| 09:12 | TRANSACTION | FD closed, ₹30,00,000 credited to A-001 |
| 09:19–10:45 | TRANSACTION | Transfers below |

*Transactions (worked example):* T1 FD→A-001 ₹30,00,000 · T2 A-001→B-207 ₹9,90,000 · T3 A-001→B-207 ₹9,90,000 · T4 A-001→X-901 ₹10,00,000 · T5 B-207→C-311 ₹19,40,000 · T6 C-311→A-001 ₹4,00,000 (closes the loop) · T7 C-311→X-902 ₹15,40,000.
*Invariants:* amount at risk = Σ outbound from A-001 = **₹29,80,000**; 3 accounts, 2 beneficiaries, 1 customer, 2 employees, 7 transactions; first txn 09:12, last 10:45; **alert `createdAt` 10:50**.

*Controls:* Cooldown (PASS · HOLLOW/bypassed), Beneficiary validation (PASS), MFA (PASS · HOLLOW, tainted input), Maker-checker (absent, so displayed as "No independent approval found").
*Evidence summary:* Customer Request NOT_FOUND · Employee Authorization MISSING · MFA Verification TAINTED · System Logs AVAILABLE · Video Evidence NOT_AVAILABLE (branch CCTV not configured).
*Replay:* candidates {mobile change, cooldown override, beneficiary add, open-B, open-C, SMS-to-new-number}. Roles: mobile NECESSARY, cooldown override NECESSARY, beneficiary NECESSARY, SMS CONCEALING, one CONTRIBUTORY. Variants must be self-consistent (checker in builder).
*Twin S1-T:* same mobile change via **V-CIP** (Grade A), cooldown respected, alert to old number → INFO/Explained.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T1.2-01 | Build | YAML present | Run builder | JSON written | ⬜ |
| T1.2-02 | Determinism | — | Build twice, compare SHA-256 | Identical | ⬜ |
| T1.2-03 | Contract validity | — | pytest + vitest | Pass | ⬜ |
| T1.2-04 | Amount invariant | — | Σ outbound from A-001 vs `listFacts.amountAtRisk` | ₹29,80,000, equal | ⬜ |
| T1.2-05 | Count invariants | — | Derive counts from transactions | 3/2/1/2/7 | ⬜ |
| T1.2-06 | Time invariants | — | createdAt vs last txn; timeline sorted | createdAt ≥ 10:45; ascending | ⬜ |
| T1.2-07 | Replay consistency | — | NECESSARY ⇒ single removal FAIL; CONCEALING ⇒ PASS | Pass | ⬜ |
| T1.2-08 | Cooldown override linked | — | Control row references the override event | Reference exists | ⬜ |
| T1.2-09 | Referential integrity | — | All ids referenced exist | Pass | ⬜ |
| T1.2-10 | Negative: missing actor | Copy YAML without `actorCredential` | Run builder | Non-zero exit naming the event | ⬜ |
| T1.2-11 | Unmasked phone | Copy with full number | Run builder | Rejected | ⬜ |

**7. Verification** - [ ] S1 has all 5 evidence rows · - [ ] twin is INFO with explanation evidence · - [ ] YAML values marked "scenario parameter"
**8. Completion** Two validated deterministic fixtures.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(data): S1 takeover scenario (ALT-2024-001) and V-CIP twin, deterministic builder [M1.2]"
git push origin feat/m1-2-hero-scenario
```
Commit the generated JSON (intentional).
**10. Rollback** R-B / R-C. Restore fixtures: `git checkout phase-1-done -- frontend/public/fixtures/`.

---

## M1.3 — Scenarios S2–S5 + Metrics Placeholder
**Owner:** Shanteshwar · **Requires:** 1.2

**1. Name** Remaining PS patterns with twins, plus the evaluation-pending metrics file.
**2. Objective** All three PS patterns are visible, each with a legitimate twin.

**3. Tasks**
- [ ] **S2** splitting after an employee limit raise (**two** raises by different credentials → one JOINTLY_NECESSARY pair) → HIGH; **S2-T** payroll batch → INFO
- [ ] **S3** profile mismatch hidden by an employee income-band edit (PROFILE_EDIT link) → HIGH; **S3-T** documented property sale → INFO. Includes customer declared profile + monthly flows
- [ ] **S4** treasury-sweep loop (group code + mandate) → INFO
- [ ] **S5** data gap (missing MFA record) → DATA_GAP with named gaps
- [ ] `data/metrics.yaml` → `metrics.json`: `status: PENDING_EVALUATION`, definitions, baselines B0–B4, ablation names, **no values**
- [ ] Validator: every ATTACK scenario (except data-gap) has a `twinOf`

**4. Files** `data/scenarios/s2*…s5*.yaml`, `data/metrics.yaml`, fixtures, tests
**5. Guidance** Reuse the S1 invariant checker. S3 must include an `explanation` block for the twin (documents). Metrics labels use the PS words: "detection accuracy", "false-positive rate", "suspicious and legitimate scenarios".

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T1.3-01 | All valid | Built | pytest + vitest | Pass | ⬜ |
| T1.3-02 | Twins present | — | Validator | Every attack has a twin | ⬜ |
| T1.3-03 | INFO explained | — | S2-T, S3-T, S4 | ≥1 explanation check found | ⬜ |
| T1.3-04 | JOINTLY_NECESSARY | S2 | Removing either raise alone | PASS; both → FAIL | ⬜ |
| T1.3-05 | DATA_GAP named | S5 | Check evidence summary | Missing items listed | ⬜ |
| T1.3-06 | No invented metrics | — | Inspect metrics.json | PENDING, no `values` | ⬜ |
| T1.3-07 | Regression | — | T1.2-01…11 | Pass | ⬜ |

**7. Verification** - [ ] 3 PS patterns each in insider-connected form · - [ ] sweep INFO exists
**8. Completion** Full scenario set validated.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(data): splitting, profile-mismatch, sweep, data-gap scenarios and pending metrics [M1.3]"
git push origin feat/m1-3-scenarios
```
**10. Rollback** R-B / R-C.

---

## M1.4 — Seed Data (124 Alerts, Cases, People)
**Owner:** Chetan · **Requires:** 1.2

**1. Name** Deterministic seed generator for `core.json`.
**2. Objective** Dashboard, Alerts list, Cases, Customers and Employees have realistic scripted volume, consistent with the scenario alerts.

**3. Tasks**
- [ ] `data/seed.yaml`: the §2.6 distributions and window
- [ ] `scripts/build_seed.py`: `random.Random(20260929)` (fixed seed) → `frontend/public/fixtures/core.json`
- [ ] Generate: 3 users, 30 employees, 40 customers, accounts, 124 alerts (scenario alerts included as FULL stubs with `listFacts` **computed from scenario transactions**), cases for status ≥ ASSIGNED, evidence summaries and risk indicators from templates by type/level
- [ ] Text templates avoid accusatory words; names synthetic (none of the team's names)

**4. Files** `data/seed.yaml`, `scripts/build_seed.py`, `backend/tests/test_seed.py`, `core.json`
**5. Guidance** Allocation: build the level, status and type lists to the exact counts, fix the scenario alerts first, then assign the rest by seeded shuffle with a repair step so both marginals hold. **Open Technical Decision:** repair algorithm (simple swap loop is enough).

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T1.4-01 | Level counts | Built | Count | 28/52/30/8/3/3 = 124 | ⬜ |
| T1.4-02 | Status counts | — | Count | 18/14/12/38/8/34 | ⬜ |
| T1.4-03 | Type counts | — | Count | Per §2.6 | ⬜ |
| T1.4-04 | Determinism | — | Build twice | Identical hash | ⬜ |
| T1.4-05 | Window | — | createdAt range | Within 1–30 Apr 2024 | ⬜ |
| T1.4-06 | Closed this week | — | closedAt ≥ asOf−7d | 32 | ⬜ |
| T1.4-07 | Integrity | — | Refs exist; IDs unique | Pass | ⬜ |
| T1.4-08 | Scenario parity | — | `listFacts` vs scenario-derived facts | Equal | ⬜ |
| T1.4-09 | Language scan | — | Banned-word list | None | ⬜ |
| T1.4-10 | Every alert has evidence summary | — | Check | All ≥1 row | ⬜ |

**7. Verification** - [ ] pages = 13, last page 4 · - [ ] 92 cases
**8. Completion** `core.json` valid on both sides, counts match spec.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(data): deterministic seed for 124 alerts, cases, employees, customers [M1.4]"
git push origin feat/m1-4-seed-data
```
**10. Rollback** R-B / R-C.

### ✅ Phase 1 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 1.1, 1.2, 1.3, 1.4 |
| Tests passed | (fill counts) |
| Known issues | (fill) |
| Git hash | `git rev-parse --short HEAD` → (fill) |
| Verification | Builders deterministic; TS/Python parity; no metric values |
| **Go/No-Go for Phase 2** | GO if all fixtures validate on both sides |

`git tag -a phase-1-done -m "Phase 1 complete" && git push origin phase-1-done`

---

# PHASE 2 — Design System, Shell, Login, Data Layer

## M2.1 — Design System & Tokens
**Owner:** Rishi · **Requires:** 0.2

**1. Name** Light design system matching the mockup.
**2. Objective** Reusable primitives so every screen looks like the mockup.

**3. Tasks**
- [ ] Commit the mockup to `docs/design/khoji-ui-mockup.png`; create `DEVIATIONS.md` from §2.4
- [ ] `npm install @fontsource/inter`; import weights 400/500/600/700 in `main.tsx`
- [ ] Tokens in `index.css` via Tailwind v4 `@theme` (§2.3)
- [ ] Primitives: `Button`, `Card`, `KpiCard`, `LevelChip`, `StatusChip`, `TypeChip`, `Tabs` (URL-synced), `Table`, `Pagination`, `Select`, `SearchInput`, `DateRangeInput`, `Modal` (native `<dialog>`), `Toast`, `EmptyState`, `Tooltip`, `Avatar` (initials), `Logo` (inline SVG)
- [ ] Helpers: `formatInr`, `formatDateTimeIST`, `maskPhone`
- [ ] Dev-only `/styleguide` route showing every primitive

**4. Files** `src/index.css`, `src/main.tsx`, `src/components/ui/*`, `src/lib/{format,mask}.ts`, `src/pages/Styleguide.tsx`, tests
**5. Guidance** Inter is self-hosted (no network call; matches the mockup's look). Native `<dialog>` gives focus handling without a UI-kit dependency. `formatInr` uses `Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0})`; dates use `timeZone:'Asia/Kolkata'`.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T2.1-01 | Contrast | Tokens | WCAG helper on each chip fg/bg | ≥ 4.5:1 | ⬜ |
| T2.1-02 | Chip has text | — | Render 6 levels | Label text visible (not colour-only) | ⬜ |
| T2.1-03 | Tabs keyboard | — | Arrows + Enter | Moves and activates | ⬜ |
| T2.1-04 | Modal | — | Open, Esc, Tab | Closes, traps focus, returns focus | ⬜ |
| T2.1-05 | Pagination edge | — | 1 page; 13 pages | Hidden; windowed "1 2 3 … 13" | ⬜ |
| T2.1-06 | `formatInr` | — | 2980000; NaN | "₹29,80,000"; "—" | ⬜ |
| T2.1-07 | Bad date | — | `formatDateTimeIST('x')` | "—", no throw | ⬜ |
| T2.1-08 | `maskPhone` | — | "9876543210" | "••••••210" | ⬜ |
| T2.1-09 | Styleguide | Dev | Open `/styleguide` | No console errors | ⬜ |

**7. Verification** VQ on chips, buttons, cards, tabs vs mockup · - [ ] lint/typecheck/test green
**8. Completion** Primitives render correctly and pass tests.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(ui): light design system, Inter font, primitives, format helpers [M2.1]"
git push origin feat/m2-1-design-system
```
**10. Rollback** R-B / R-C.

---

## M2.2 — App Shell, Routing
**Owner:** Rishi · **Requires:** 2.1

**1. Name** Sidebar + top bar + full route table.
**2. Objective** Every screen has a route; unbuilt ones show a clear placeholder.

**3. Tasks**
- [ ] Sidebar: 10 items with lucide icons (LayoutDashboard, Bell/AlertTriangle, FolderSearch, ArrowLeftRight, Users, IdCard, Network, BarChart3, FileText, Settings); "Investigations" → `/cases`
- [ ] Top bar: search box (UI only), bell, user chip, **prototype badge**
- [ ] `createBrowserRouter` with all routes from §2.1 (unbuilt → `PlaceholderPage`, "Not part of this build")
- [ ] 404 page

**4. Files** `src/routes.tsx`, `src/components/layout/{AppShell,Sidebar,TopBar}.tsx`, `src/pages/{NotFound,Placeholder}.tsx`, tests
**5. Guidance** Tab state lives in the URL (`/alerts/:id/:tab?`) so deep links and Playwright work.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T2.2-01 | Nav items | — | Render | 10 items, correct labels | ⬜ |
| T2.2-02 | Active state | — | Navigate | Blue active pill on current item | ⬜ |
| T2.2-03 | Unknown route | — | `/xyz` | NotFound | ⬜ |
| T2.2-04 | Badge | — | Every route | Prototype badge present | ⬜ |
| T2.2-05 | Keyboard | — | Tab through | Visible focus | ⬜ |
| T2.2-06 | Placeholder | — | `/settings` | "Not part of this build" | ⬜ |
| T2.2-07 | Regression | — | M2.1 tests | Pass | ⬜ |

**7. Verification** VQ on shell (sidebar width, item spacing, top bar) at 1920×1080 and 1366×768
**8. Completion** All routes resolve; shell matches mockup.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(ui): app shell with 10-item sidebar, top bar, full route table [M2.2]"
git push origin feat/m2-2-app-shell
```
**10. Rollback** R-B / R-C.

---

## M2.3 — Login Page + Demo Auth
**Owner:** Chetan · **Requires:** 2.2

**1. Name** Two-panel login (mockup screen 1) and a UI-only auth gate.
**2. Objective** Video starts at a faithful login; protected routes need a session.

**3. Tasks**
- [ ] Left panel: logo, "Uncovering the Real Story Behind Every Transaction", "Linking People · Actions · Money", inline SVG bank skyline, 4 feature icons (Detect Insider Risk, Trace Money Flows, Explain Every Alert, Empower Investigators), footer copy per C3
- [ ] Right card: username, password (eye toggle), remember me, forgot password (toast "Not available in prototype"), Sign in
- [ ] `AuthContext`; `ProtectedRoute` (redirect to `/login?next=`); sign out in user menu
- [ ] `.env.example` with demo credentials (public, non-secret)

**4. Files** `src/auth/*`, `src/pages/Login.tsx`, `.env.example`, tests
**5. Guidance** Session in `sessionStorage` (`{username, signedInAt}`); "remember me" stores **username only** in `localStorage`. This is not real security. Real authentication and roles come in the second half.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T2.3-01 | Valid login | — | Enter demo credentials | Redirect `/dashboard`; user chip shows name | ⬜ |
| T2.3-02 | Invalid login | — | Wrong password | Generic error; no session | ⬜ |
| T2.3-03 | Empty fields | — | Submit | Field validation messages | ⬜ |
| T2.3-04 | **Unauthorized access** | Signed out | Open `/alerts` | Redirect to `/login?next=/alerts` | ⬜ |
| T2.3-05 | Return after login | — | Login from T2.3-04 | Lands on `/alerts` | ⬜ |
| T2.3-06 | Sign out | Signed in | Sign out, press Back | Redirected to login | ⬜ |
| T2.3-07 | Corrupt session | — | Put invalid JSON in sessionStorage | Treated as signed out, no crash | ⬜ |
| T2.3-08 | Remember me | — | Tick and login | Only username in localStorage; password nowhere | ⬜ |
| T2.3-09 | Password field | — | Inspect | `type=password`; eye toggles | ⬜ |

**7. Verification** VQ vs screen 1 · - [ ] copy matches C3 · - [ ] `.env.local` untracked
**8. Completion** Login works; all non-login routes guarded.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(auth): login page and demo auth gate with protected routes [M2.3]"
git push origin feat/m2-3-login
```
**10. Rollback** R-B / R-C. Regression: re-run M2.2 tests.

---

## M2.4 — Data Loader & Store
**Owner:** Aryan · **Requires:** 1.4, 2.2

**1. Name** Validated loading and shared state.
**2. Objective** Every screen reads validated data; failures are visible and safe.

**3. Tasks**
- [ ] `loader.ts`: fetch and zod-validate `core.json`; **lazy-load** scenario files on alert open (cached)
- [ ] `store.tsx` (Context + `useReducer`): currentUser, core, scenarios, selection (event/node), replay overlay, cases, notes, toasts
- [ ] `selectors.ts` and `lib/metrics.ts` (pure): counts by level/status/type, KPIs, trend series, top patterns, `deriveAlertFacts`
- [ ] Loading, error panel, `ErrorBoundary`; `VITE_DATA_SOURCE` flag (default `fixtures`)

**4. Files** `src/data/*`, `src/lib/metrics.ts`, `src/components/ui/{ErrorBoundary,ErrorPanel,LoadingState}.tsx`, tests
**5. Guidance** No external state library (Context + reducer is enough at this size). `asOf` comes from fixture metadata, never `Date.now()`.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T2.4-01 | Load core | Fixtures | Mock fetch with real files | Store populated | ⬜ |
| T2.4-02 | Invalid data | Bad enum | Load | Error panel names file + field | ⬜ |
| T2.4-03 | 404 | — | Mock 404 | "Fixture not found" | ⬜ |
| T2.4-04 | Slow | Delayed | Render | Loading then data | ⬜ |
| T2.4-05 | Lazy scenario | — | Open S1 twice | One fetch; cached | ⬜ |
| T2.4-06 | KPI selectors | — | Compute | 124 / 28 / 46 / 32 | ⬜ |
| T2.4-07 | Immutability | — | Dispatch mutation | Original state untouched | ⬜ |
| T2.4-08 | Crash contained | Throwing child | Render in boundary | Fallback; shell visible | ⬜ |

**7. Verification** - [ ] `.env.local` untracked, `.env.example` present · - [ ] error text readable
**8. Completion** Store serves validated data; failure paths tested.
**9. Git**
```bash
git status
git add .
git commit-aryan -m "feat(data): validated loader, lazy scenarios, store, pure metric selectors [M2.4]"
git push origin feat/m2-4-data-layer
```
**10. Rollback** R-B / R-C.

---

## M2.5 — Global Search & Notifications
**Owner:** Aryan · **Requires:** 2.4

**1. Name** Working top-bar search and bell.
**2. Objective** Search accounts, transactions, employees, customers and alerts; the bell lists recent High alerts.

**3. Tasks**
- [ ] Search index built at load; ranking exact ID > prefix > contains; grouped results, max 8; ↑/↓/Enter/Esc; `/` focuses the box; debounce 200 ms
- [ ] Result click → alert / customer / employee / graph highlight
- [ ] Bell: 5 most recent HIGH alerts, unread count in memory, mark read on open

**4. Files** `src/components/layout/{GlobalSearch,NotificationBell}.tsx`, `src/lib/searchIndex.ts`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T2.5-01 | ID search | Loaded | "ALT-2024-001" | Alert first | ⬜ |
| T2.5-02 | Ranking | — | "E1" | Prefix matches before contains | ⬜ |
| T2.5-03 | No result | — | "zzz" | "No matches" | ⬜ |
| T2.5-04 | Keyboard | — | ↓ Enter | Navigates | ⬜ |
| T2.5-05 | **Unsafe text** | — | Type `<img src=x onerror=alert(1)>` | Shown literally; nothing executes | ⬜ |
| T2.5-06 | Bell | — | Open | 5 HIGH items; unread → 0 | ⬜ |
| T2.5-07 | Shortcut | — | Press `/` | Search focused | ⬜ |

**7. Verification** VQ on search box + bell
**8. Completion** Search and bell work with fixtures.
**9. Git**
```bash
git status
git add .
git commit-aryan -m "feat(ui): global search with ranking and keyboard, notification bell [M2.5]"
git push origin feat/m2-5-search-bell
```
**10. Rollback** R-B / R-C.

### ✅ Phase 2 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 2.1–2.5 |
| Tests passed / Known issues / Hash | (fill) |
| Verification | Login → shell → search works; `check.sh` green |
| **Go/No-Go for Phase 3** | GO if login guard, store, and design system pass tests |

`git tag -a phase-2-done -m "Phase 2 complete" && git push origin phase-2-done`

---

# PHASE 3 — Dashboard & Alerts List

## M3.1 — Dashboard: KPIs, Recent Alerts, Top Patterns
**Owner:** Chetan · **Requires:** 2.4

**1. Name** Dashboard top half (mockup screen 2).
**2. Objective** KPI cards, recent alerts and top patterns, all computed from data.

**3. Tasks**
- [ ] 4 KpiCards (Total Alerts, High Risk, Under Investigation, Closed This Week); deltas computed vs previous 7 days, hidden if no prior data
- [ ] Recent Alerts (5 latest): Time (relative to `asOf`: "Today 10:50"), Risk chip, Title, Amount, Involved Entities ("3 accounts, 2 employees"); "View All Alerts" link
- [ ] Top Patterns Detected: 7 horizontal bars with counts (top 7 by count)

**4. Files** `src/pages/Dashboard.tsx`, `src/components/dashboard/{KpiRow,RecentAlerts,TopPatterns}.tsx`, tests
**5. Guidance** No chart library yet: bars are plain divs. All numbers come from `metrics.ts`.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T3.1-01 | KPI values | Loaded | Render | 124 / 28 / 46 / 32 | ⬜ |
| T3.1-02 | Live update | — | Assign an unassigned alert | KPI recalculates | ⬜ |
| T3.1-03 | Recent order | — | Render | Newest first, 5 rows | ⬜ |
| T3.1-04 | Relative time | — | Alert at asOf date | "Today HH:MM" | ⬜ |
| T3.1-05 | Top 7 | — | Render | Order 28,24,18,14,12,10,8; PROFILE_MISMATCH/INSIDER_ACTIVITY excluded | ⬜ |
| T3.1-06 | Delta hidden | No prior week data | Render | No delta text | ⬜ |
| T3.1-07 | Empty data | Empty core | Render | Empty states, no NaN | ⬜ |

**7. Verification** VQ vs screen 2 (KPI row, right column "Top Patterns")
**8. Completion** Numbers match the seed spec and update live.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(dashboard): KPI cards, recent alerts, top patterns from seed data [M3.1]"
git push origin feat/m3-1-dashboard-kpis
```
**10. Rollback** R-B / R-C.

---

## M3.2 — Dashboard Charts (Alert Trend, Risk Distribution)
**Owner:** Chetan · **Requires:** 3.1

**1. Name** Line chart and donut.
**2. Objective** Charts match the mockup; data comes from pure functions.

**3. Tasks**
- [ ] `npm install recharts` (**why:** declarative line/donut charts with tooltips and legends; hand-rolled SVG would cost more time and risk)
- [ ] Alert Trend: daily counts, series High/Medium/Watch, 30 points
- [ ] Risk Distribution donut: centre total 124; legend with count and percentage for 6 levels (largest-remainder rounding so percentages total 100)
- [ ] Each chart gets `aria-label` and a visually hidden data table
- [ ] In `setup.ts` add a `ResizeObserver` stub; tests render charts with fixed width/height

**4. Files** `src/components/dashboard/{AlertTrend,RiskDonut}.tsx`, `src/lib/metrics.ts` (series), tests
**5. Guidance** Chart *data* is tested as pure functions; the chart *rendering* is checked visually and in E2E.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T3.2-01 | Trend length | — | `trendSeries()` | 30 points | ⬜ |
| T3.2-02 | Trend totals | — | Sum series | High=28, Medium=52, Watch=30 | ⬜ |
| T3.2-03 | Donut percentages | — | Compute | Sum = 100 | ⬜ |
| T3.2-04 | Legend | — | Render | 6 entries with counts | ⬜ |
| T3.2-05 | Accessible fallback | — | Query hidden table | Rows match data | ⬜ |
| T3.2-06 | Empty data | — | Render | "No data" state | ⬜ |
| T3.2-07 | Regression | — | T3.1 tests | Pass | ⬜ |

**7. Verification** VQ vs screen 2 (chart proportions, legend layout) · - [ ] no console errors
**8. Completion** Dashboard matches mockup with computed data.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(dashboard): alert trend line chart and risk distribution donut [M3.2]"
git push origin feat/m3-2-dashboard-charts
```
**10. Rollback** R-B / R-C. If Recharts breaks the build: `npm uninstall recharts` and revert the branch.

---

## M3.3 — Alerts List
**Owner:** Rishi · **Requires:** 2.4

**1. Name** Alerts table (mockup screen 3).
**2. Objective** Search, filter, page and export all 124 alerts.

**3. Tasks**
- [ ] Header "Alerts" + Export button; level tabs with counts (All, High, Medium, Watch, Inconclusive, Near-miss, Explained)
- [ ] Search "Search alerts…"; "All Types" and "All Risk Levels" selects; date range (native inputs styled to match)
- [ ] Table: ID, Time, Risk, Alert Title, Amount, Type, Status; default sort newest first; row → `/alerts/:id/overview`
- [ ] Pagination 10/page, "Showing 1–10 of 124 alerts"
- [ ] Filter/page state in the URL query string
- [ ] CSV export of the **filtered** rows (RFC 4180 quoting, UTF-8 BOM)

**4. Files** `src/pages/Alerts.tsx`, `src/components/alerts/*`, `src/lib/csv.ts`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T3.3-01 | Default | Loaded | Render | 10 rows, "1–10 of 124", 13 pages | ⬜ |
| T3.3-02 | High tab | — | Click | 28 rows over 3 pages | ⬜ |
| T3.3-03 | Combined filters | — | High + type + search | Intersection only | ⬜ |
| T3.3-04 | Date range | — | Boundary dates | Inclusive of the whole end day (IST) | ⬜ |
| T3.3-05 | Last page | — | `?page=13` | 4 rows | ⬜ |
| T3.3-06 | Bad page | — | `?page=99`, `?page=abc` | Clamped to valid page | ⬜ |
| T3.3-07 | Empty result | — | Impossible filter | "No alerts match" | ⬜ |
| T3.3-08 | CSV | — | Export | Row count = filtered; commas/quotes/₹ correct; BOM | ⬜ |
| T3.3-09 | No score column | — | Inspect | Level chip only | ⬜ |
| T3.3-10 | Navigation | — | Click row | URL `/alerts/<id>/overview` | ⬜ |

**7. Verification** VQ vs screen 3 · - [ ] regression T2.x/T3.1 pass
**8. Completion** Every filter path tested; export works.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(alerts): filterable paginated alerts list with CSV export [M3.3]"
git push origin feat/m3-3-alerts-list
```
**10. Rollback** R-B / R-C.

### ✅ Phase 3 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 3.1, 3.2, 3.3 |
| Tests / Issues / Hash | (fill) |
| Verification | Login → Dashboard → Alerts → open an alert URL works; numbers match seed spec |
| **Go/No-Go for Phase 4** | GO if VQ passes for screens 2 and 3 |

`git tag -a phase-3-done -m "Phase 3 complete" && git push origin phase-3-done`

---

# PHASE 4 — Alert Investigation (Tabbed)

## M4.1 — Alert Detail Shell + Overview Tab
**Owner:** Rishi · **Requires:** 3.3

**1. Name** Header, tab bar and Overview (mockup screen 4).
**2. Objective** Every alert opens with level, reasons and derived facts.

**3. Tasks**
- [ ] Route `/alerts/:id/:tab?`; "‹ Back to Alerts"; title `ALT-… – title`; LevelChip; amount; Status, Assigned to, Created; **Assign / Reassign** button (disabled until M5.1)
- [ ] 7 tabs (URL-synced). SUMMARY alerts: only Overview, Evidence, Notes enabled; others show "Full reconstruction is included only for scenario alerts in this prototype"
- [ ] Alert Summary card: description, **Risk Level chip + top reasons (no score)**, Type, Total Amount ("amount at risk" tooltip definition), Accounts/Employees/Transactions counts, First/Last Transaction
- [ ] Risk Indicators card; Related Entities card with View links
- [ ] Footer: "Operational dependency under modelled controls. No finding of intent."

**4. Files** `src/pages/AlertDetail.tsx`, `src/components/alerts/{AlertHeader,TabBar,SummaryCard,RiskIndicators,RelatedEntities}.tsx`, `src/lib/metrics.ts` (`deriveAlertFacts`), tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.1-01 | Facts | S1 | Open Overview | ₹29,80,000; 3/2/7; first 09:12, last 10:45 | ⬜ |
| T4.1-02 | Derived = list | — | Compare with `listFacts` | Equal | ⬜ |
| T4.1-03 | Tab URL | — | `/alerts/.../timeline`; `/…/bogus` | Timeline; bogus → overview | ⬜ |
| T4.1-04 | Unknown alert | — | `/alerts/NOPE` | Not-found page | ⬜ |
| T4.1-05 | SUMMARY gating | Seed alert | Open | 3 tabs enabled; others explain why | ⬜ |
| T4.1-06 | No score | — | Search text | No "Risk Score" or `/100` | ⬜ |
| T4.1-07 | No-intent statement | — | Every level | Present | ⬜ |
| T4.1-08 | Language scan | — | Banned words | None | ⬜ |
| T4.1-09 | Regression | — | T3.x | Pass | ⬜ |

**7. Verification** VQ vs screen 4 · - [ ] open one alert of each level
**8. Completion** Overview correct for FULL and SUMMARY alerts.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(alert): detail shell, tabs, overview with derived facts and no risk score [M4.1]"
git push origin feat/m4-1-alert-overview
```
**10. Rollback** R-B / R-C.

---

## M4.2 — Transaction Graph Tab
**Owner:** Chetan · **Requires:** 4.1

**1. Name** Money-flow graph (mockup screen 5).
**2. Objective** Circular transfer and employee links are visible and interactive.

**3. Tasks**
- [ ] `npm install cytoscape` and `-D @types/cytoscape` (**why:** mature graph rendering with styling, layouts and events)
- [ ] Toolbar: legend (Customer, Account, Employee, Transaction, Beneficiary), **Layout select** (Hierarchical = fixture preset · Force = `cose`, `randomize:false` · Circle), zoom in/out, fit, fullscreen
- [ ] Style: account nodes = large blue circles with letter + ₹ balance; person nodes = icon badges; edge labels `T2 ₹9,90,000`; **cycle edges red**; employee-link edges dashed with connection-type label
- [ ] Click → shared selection; external selection highlights
- [ ] SUMMARY alerts show the empty state

**4. Files** `src/components/graph/{MoneyGraph,toElements,graphStyles,GraphToolbar}.ts(x)`, tests
**5. Guidance** Default = preset positions, so every video take is identical. jsdom cannot draw canvas: test `toElements()` and layout-option builders; check visuals in VQ and E2E.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.2-01 | Mapping | S1 | `toElements` | 3 accounts, employees, 2 beneficiaries, 7 tx edges | ⬜ |
| T4.2-02 | Cycle class | S1 | Mapping | Loop edges `cycle` | ⬜ |
| T4.2-03 | Missing positions | Copy w/o layout | Render | Fallback layout + console warning | ⬜ |
| T4.2-04 | Layout switch | — | Force, Circle, Hierarchical | No crash; positions change/restore | ⬜ |
| T4.2-05 | Selection sync | Dev | Click edge | Store selection updates | ⬜ |
| T4.2-06 | Fullscreen unsupported | API missing | Click | Button disabled/fallback, no throw | ⬜ |
| T4.2-07 | Unmount x5 | — | Navigate away/back | No duplicate canvases | ⬜ |
| T4.2-08 | Sweep twin | S4 | Open | Cycle shown, labelled Explained | ⬜ |

**7. Verification** VQ vs screen 5
**8. Completion** Graph readable and interactive for all FULL scenarios.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(graph): transaction graph tab with layouts, cycle highlight, selection sync [M4.2]"
git push origin feat/m4-2-graph-tab
```
**10. Rollback** R-B / R-C. If Cytoscape breaks the build: uninstall and revert.

---

## M4.3 — Timeline Tab
**Owner:** Chetan · **Requires:** 4.1

**1. Name** Vertical tagged timeline (mockup screen 6).
**2. Objective** Employee actions, account-state changes, control checks and transactions in one chronological list.

**3. Tasks**
- [ ] Date group header ("Apr 30, 2024"); rows: time, coloured dot, title, detail, right-aligned **category tag** (Employee Activity / Account State Change / **Control Check** / Transaction)
- [ ] Uncertainty chip ("±30 s") where present; **dashed "Missing evidence" row** for gaps
- [ ] Click ↔ graph selection sync; scroll selected into view
- [ ] Overlay prop for the Remove cascade (greyed rows, "not executed")
- [ ] Phones shown only masked

**4. Files** `src/components/timeline/{Timeline,TimelineRow,CategoryTag}.tsx`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.3-01 | Order | S1 | Render | Ascending; 4 categories present | ⬜ |
| T4.3-02 | Cooldown override | S1 | Find row | Control Check row exists | ⬜ |
| T4.3-03 | Gap row | S5 | Render | Dashed missing-evidence row | ⬜ |
| T4.3-04 | Masked numbers | S1 | Scan | No 10-digit numbers | ⬜ |
| T4.3-05 | Sync | Dev | Click graph edge | Row highlighted and scrolled | ⬜ |
| T4.3-06 | Overlay | — | Set overlay ids | Rows greyed | ⬜ |
| T4.3-07 | Multi-day | Scenario with 2 dates | Render | Two date headers | ⬜ |

**7. Verification** VQ vs screen 6 · - [ ] regression 4.1/4.2
**8. Completion** Timeline matches mockup plus Control Check tag.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(timeline): vertical tagged timeline with control checks, gaps, sync [M4.3]"
git push origin feat/m4-3-timeline
```
**10. Rollback** R-B / R-C.

---

## M4.4 — Employee Activity Tab (Access Rights & Privilege Misuse)
**Owner:** Shanteshwar · **Requires:** 4.1

**1. Name** Employee card, activities and misuse signals (mockup screen 7).
**2. Objective** Directly serves the PS words "access rights" and "insider privilege misuse", showing misuse of **valid** access without accusing anyone.

**3. Tasks**
- [ ] Employee card (initials avatar, ID, name, role, branch, department, status); switcher if the alert involves 2 employees
- [ ] "Recent Activities (Last 30 Days)": Date & Time, Action, Account, Channel, Location; "View All Activity" expands inline
- [ ] Behavioural Analysis cards: Unusual Time Activity, Access Outside Portfolio, High-Risk Actions, Overall Risk (tooltip: "signal level, not a finding of intent")
- [ ] **Access-Rights panel:** permissions held (✓/✗), assigned portfolio, actions-in-case table (permitted? in portfolio? customer evidence grade? signals), signal chips **P1–P10** with definitions, attribution consistency (HIGH/MEDIUM/LOW), "Who else could have done this: N staff"
- [ ] Missing attendance → "attendance data unavailable"; credential-compromise variant uses "credential misuse indicators"

**4. Files** `src/components/employee/{EmployeeCard,ActivityTable,BehaviourCards,AccessRightsPanel,signalDefinitions}.ts(x)`, tests
**5. Guidance** Signal definitions live in one constants file (from the technical doc's P1–P10 table).

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.4-01 | Activities | S1 | Render E17 | Rows incl. mobile change and beneficiary add | ⬜ |
| T4.4-02 | Signals | S1 | Render | P1, P2, P3, P9 chips with tooltips | ⬜ |
| T4.4-03 | Permitted-but-misused | S1 | Actions table | Permitted ✓, portfolio ✗, evidence Grade X | ⬜ |
| T4.4-04 | Switch employee | S1 | Choose E22 | Panel updates (onboarding actions) | ⬜ |
| T4.4-05 | Compromise wording | Variant fixture | Render | "credential misuse indicators"; attribution LOW | ⬜ |
| T4.4-06 | Missing HR data | Fixture w/o attendance | Render | "attendance data unavailable" | ⬜ |
| T4.4-07 | Language scan | — | Banned words | None | ⬜ |
| T4.4-08 | SUMMARY alert | Seed alert | Open tab | Disabled with explanation | ⬜ |

**7. Verification** VQ vs screen 7
**8. Completion** Access rights and misuse signals visible on insider-connected alerts.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(employee): activity tab with access-rights panel and P1-P10 misuse signals [M4.4]"
git push origin feat/m4-4-employee-activity
```
**10. Rollback** R-B / R-C.

---

## M4.5 — Evidence Tab (Evidence, Control Path, Documents)
**Owner:** Rishi · **Requires:** 4.1, 4.3

**1. Name** Evidence & Authorization (mockup screen 8) + Control Path (Hollow Pass).
**2. Objective** Mandatory evidence panel on every alert, and the core innovation visible.

**3. Tasks**
- [ ] **Evidence Summary** rows with status icons: Customer Request (Not Found), Employee Authorization (Missing), MFA Verification (Tainted), System Logs (Available), Video Evidence (Not Available) + detail text
- [ ] **Control Path card:** row per control: outcome (PASS/FAIL), integrity (GENUINE/HOLLOW/UNKNOWN), reason, writer's auth grade; click reason → selects writer event in timeline. FAIL = "Control held". UNKNOWN = "Authorization data unavailable (Grade U)"
- [ ] Evidence confidence chip + missing-evidence list (NOT_FOUND / MISSING / NOT_AVAILABLE items)
- [ ] **Evidence Documents** list with real downloads: `generateEvidenceDoc(kind, alert, scenario)` → deterministic JSON/CSV/TXT; size = real `Blob.size`
- [ ] SUMMARY alerts: summary only + note that the Control Path is available for scenario alerts

**4. Files** `src/components/evidence/{EvidenceSummary,ControlPath,ControlRow,DocumentList,GradeBadge}.tsx`, `src/lib/evidenceDocs.ts`, tests
**5. Guidance** Glossary shown in a tooltip: **Tainted** = input set without customer-verified authorization; **Hollow** = control passed on tainted input.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.5-01 | Summary rows | S1 | Render | 5 rows, correct statuses | ⬜ |
| T4.5-02 | Hollow | S1 | Control Path | MFA + Cooldown rows PASS · HOLLOW with reason | ⬜ |
| T4.5-03 | Genuine on twin | S1-T | Render | PASS · GENUINE | ⬜ |
| T4.5-04 | Unknown | S5 | Render | UNKNOWN + Grade U text | ⬜ |
| T4.5-05 | Held control | Fixture row FAIL | Render | "Control held" | ⬜ |
| T4.5-06 | Writer link | Dev | Click reason | Timeline row selected | ⬜ |
| T4.5-07 | Download | S1 | Click a document | File saved; deterministic content; size equals displayed | ⬜ |
| T4.5-08 | Missing list | S1 | Render | "Video Evidence" listed as missing | ⬜ |
| T4.5-09 | Panel on every alert | All alerts | Loop | Evidence summary present, incl. INFO and DATA_GAP | ⬜ |

**7. Verification** VQ vs screen 8 · - [ ] downloaded files contain no real personal data
**8. Completion** PS "evidence panel on every alert" holds; Hollow Pass traceable to its source event.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(evidence): evidence tab with control path hollow-pass and generated documents [M4.5]"
git push origin feat/m4-5-evidence-tab
```
Do not commit downloaded sample files.
**10. Rollback** R-B / R-C.

---

## M4.6 — But-for Analysis: Remove Replay
**Owner:** Aryan · **Requires:** 4.3

**1. Name** But-for result and interactive Remove (mockup screen 9).
**2. Objective** Show the core counterfactual honestly (precomputed).

**3. Tasks**
- [ ] Segmented control `Replay | Legitimate twin | Exposure` (twin/exposure disabled until M4.7/4.8)
- [ ] Result banner (**blue**, per C8): "NECESSARY: Removing this employee action would prevent the transaction path from executing." + the four **Analysis Steps** from the fixture
- [ ] "Try removing other actions": candidate checkboxes → `matchVariant()` (order-insensitive) → outcome PASS/FAIL + cascade overlay on Timeline
- [ ] Roles, minimal disabling sets, coverage; semantics note ("Other actors held fixed. Not causation. No intent."); **"Precomputed in prototype"** label
- [ ] Unmatched combination → "This combination is not precomputed in the prototype."; Reset button; honour `prefers-reduced-motion`

**4. Files** `src/components/replay/{ButForPanel,RemovePanel,matchVariant,CascadeOverlay}.ts(x)`, tests
**5. Guidance** UI is written so the second half can swap the lookup for `POST /api/replay` without changing components.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.6-01 | Remove mobile change | S1 | Check it | FAIL; cascade greyed rows | ⬜ |
| T4.6-02 | Remove concealing SMS | S1 | Check it | PASS; role CONCEALING | ⬜ |
| T4.6-03 | Set match | — | `matchVariant(['b','a'])` | Matches `['a','b']` | ⬜ |
| T4.6-04 | Not precomputed | — | Unlisted combo | Honest message, no fake outcome | ⬜ |
| T4.6-05 | Joint pair | S2 | Remove one, then both | PASS, then FAIL | ⬜ |
| T4.6-06 | Reset | — | Toggle then Reset | Restored | ⬜ |
| T4.6-07 | Reduced motion | Emulated | Toggle | No animation | ⬜ |
| T4.6-08 | Banner colour | — | Inspect | Not green | ⬜ |
| T4.6-09 | Regression | — | 4.3 tests | Pass | ⬜ |

**7. Verification** VQ vs screen 9 · - [ ] semantics note and precomputed label visible
**8. Completion** Remove works for every precomputed variant and fails honestly otherwise.
**9. Git**
```bash
git status
git add .
git commit-aryan -m "feat(replay): but-for tab with interactive remove, cascade overlay, honest fallback [M4.6]"
git push origin feat/m4-6-remove-replay
```
**10. Rollback** R-B / R-C. If the overlay breaks the timeline, `git revert` only the overlay commit.

---

## M4.7 — But-for: Legitimate Twin Comparison
**Owner:** Chetan · **Requires:** 4.5, 4.6

**1. Name** "Fraud path vs legitimate path" sub-panel.
**2. Objective** Show why false positives stay low: same actions, different authorization.

**3. Tasks**
- [ ] Two aligned step columns (Attack | Legitimate twin) with grade, control integrity, level chip
- [ ] `findDivergence()` highlights the first differing step ("customer-origin artifact: missing vs V-CIP")
- [ ] Sub-tab disabled with tooltip when no twin

**4. Files** `src/components/twin/{TwinPanel,findDivergence}.ts(x)`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.7-01 | Divergence | S1 vs S1-T | Run | Index of mobile-change step | ⬜ |
| T4.7-02 | Twin level | — | Render | Explained chip | ⬜ |
| T4.7-03 | No twin | S5 | Open | Sub-tab disabled | ⬜ |
| T4.7-04 | Unequal lengths | Synthetic | Function | Pads, no crash | ⬜ |
| T4.7-05 | Payroll twin | S2 | Render | Divergence at mandate/explanation step | ⬜ |
| T4.7-06 | Regression | — | 4.6 tests | Pass | ⬜ |

**7. Verification** - [ ] divergence label readable at 1080p
**8. Completion** Works for S1, S2, S3.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(twin): fraud path vs legitimate twin comparison with divergence point [M4.7]"
git push origin feat/m4-7-twin
```
**10. Rollback** R-B / R-C.

---

## M4.8 — But-for: Reach (Exposure)
**Owner:** Shanteshwar · **Requires:** 4.6

**1. Name** "Other accounts in the same state" sub-panel.
**2. Objective** Pre-loss value: accounts satisfying the path's preconditions except the final transfer.

**3. Tasks**
- [ ] Table: account, predicate chips, status (EXPOSED / NEAR), exposure ₹ (labelled "scenario value"), writer credentials
- [ ] Sort by exposure; filter EXPOSED/NEAR; empty state; "Precomputed" label

**4. Files** `src/components/reach/{ReachPanel,PredicateChip}.tsx`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T4.8-01 | Sort | S1 | Render | Descending exposure | ⬜ |
| T4.8-02 | Filter | — | NEAR | Only NEAR | ⬜ |
| T4.8-03 | Empty | Scenario w/o reach | Render | "No accounts in this state" | ⬜ |
| T4.8-04 | Labels | — | Render | "scenario value", "precomputed" visible | ⬜ |
| T4.8-05 | Currency | — | Render | en-IN format | ⬜ |
| T4.8-06 | Regression | — | 4.6/4.7 tests | Pass | ⬜ |

**7. Verification** - [ ] labels visible in recording
**8. Completion** Reach visible on S1 with honest labelling.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(reach): exposure sub-panel with predicates, filters, honest labels [M4.8]"
git push origin feat/m4-8-reach
```
**10. Rollback** R-B / R-C.

### ✅ Phase 4 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 4.1–4.8 |
| Tests / Issues / Hash | (fill) |
| Verification | Full manual walk of ALT-2024-001 through all 7 tabs; VQ passes for screens 4–9; no console errors |
| **Go/No-Go for Phase 5** | GO if the hero alert works end to end |

`git tag -a phase-4-done -m "Phase 4 complete" && git push origin phase-4-done`

---

# PHASE 5 — Cases, Customers, Analytics, Reports

## M5.1 — Cases, Assign Dialog, Notes
**Owner:** Shanteshwar · **Requires:** 4.1, 2.4

**1. Name** Case workflow + Cases page (mockup screen 10) + Notes tab.
**2. Objective** PS outcome: case assignment, with an enforced state machine.

**3. Tasks**
- [ ] `caseMachine.ts`: `NEW → UNDER_REVIEW → ASSIGNED → INVESTIGATING ⇄ PENDING_EVIDENCE → DECIDED → CLOSED` (`canTransition` pure)
- [ ] Cases page: 5 KPI cards (My Cases, Open, Under Review, Pending Evidence, Closed; computed); table (Case ID, Related Alert, Case Title, Priority, Status, Assigned To, Created); "Create Case" modal; second button "Export CSV" (assumption)
- [ ] Alert header: **Assign / Reassign** dialog (investigator list) + status menu; first assignment auto-creates the case
- [ ] **Decision modal:** decision type (insider-connected / external fraud / customer dispute / process violation / false positive / inconclusive) + **required rationale**
- [ ] **Notes tab:** add note (trimmed, max length), list, append-only activity log
- [ ] Docs sync: update state names in the technical doc §13

**4. Files** `src/components/cases/{caseMachine,CasesTable,AssignDialog,DecisionDialog,NotesPanel,ActivityLog}.ts(x)`, `src/pages/Cases.tsx`, store additions, tests
**5. Guidance** State is in memory: a reload resets cases (documented). Server-side authorization is deferred; **no role enforcement in this build**.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T5.1-01 | Valid path | — | Walk NEW→CLOSED | Each allowed; log in order | ⬜ |
| T5.1-02 | Invalid transition | — | NEW→DECIDED | Blocked with message | ⬜ |
| T5.1-03 | Decision needs rationale | — | Empty rationale | Rejected | ⬜ |
| T5.1-04 | Auto-create case | Unassigned alert | Assign | Case created, status ASSIGNED, one case only | ⬜ |
| T5.1-05 | Reassign | — | Reassign | Logged; assignee updated | ⬜ |
| T5.1-06 | Pending loop | — | INVESTIGATING⇄PENDING_EVIDENCE | Allowed | ⬜ |
| T5.1-07 | Dashboard link | — | Assign then open Dashboard | KPIs recalculated | ⬜ |
| T5.1-08 | Notes validation | — | Empty / 5,000+ chars / `<script>` | Rejected / capped / shown literally | ⬜ |
| T5.1-09 | Closed alert | CLOSED | Open | Assign disabled | ⬜ |
| T5.1-10 | Reload | Case exists | Refresh | Cleared (documented) | ⬜ |

**7. Verification** VQ vs screen 10 · - [ ] state machine matches the technical-doc diagram
**8. Completion** Full lifecycle demonstrable; KPIs live.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(cases): case state machine, cases page, assign/decision dialogs, notes [M5.1]"
git push origin feat/m5-1-cases
```
**10. Rollback** R-B / R-C.

---

## M5.2 — Customers & Profile Analysis
**Owner:** Rishi · **Requires:** 4.1, 1.3

**1. Name** Customer list + profile (mockup screen 11).
**2. Objective** Show the **profile-mismatch** pattern visually.

**3. Tasks**
- [ ] `/customers` table (ID, Name, Type, KYC risk rating, Accounts, Linked alerts)
- [ ] `/customers/:id` header (avatar, ID, name, type, KYC risk chip, Verified) + tabs: **Overview** (Profile Summary: age, occupation, annual income, location; linked alerts), **Accounts**, **Transactions**, **Profile Analysis**
- [ ] Profile Analysis: declared income vs observed monthly inflow, counterparty diversity, pass-through ratio (computed from fixtures) + **explanation evidence** ("property-sale deed on file") + "profile edited by E-xx on date" link to the alert (S3)

**4. Files** `src/pages/{Customers,CustomerProfile}.tsx`, `src/components/customers/*`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T5.2-01 | List | Loaded | Render | 40 customers | ⬜ |
| T5.2-02 | Profile | C001 | Open | Summary matches fixture | ⬜ |
| T5.2-03 | Mismatch | S3 customer | Profile Analysis | Observed ≫ declared; edit link shown | ⬜ |
| T5.2-04 | Explained twin | S3-T customer | Profile Analysis | Explanation evidence shown, no alert | ⬜ |
| T5.2-05 | Unknown id | `/customers/NOPE` | Open | Not-found | ⬜ |
| T5.2-06 | Zero flows | Customer w/o transactions | Open | Empty state, no NaN | ⬜ |
| T5.2-07 | Tab URL | — | Deep link to tab | Correct tab | ⬜ |

**7. Verification** VQ vs screen 11
**8. Completion** Profile mismatch is visible and explainable.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(customers): customer list, profile pages and profile analysis [M5.2]"
git push origin feat/m5-2-customers
```
**10. Rollback** R-B / R-C.

---

## M5.3 — Analytics + Evaluation Tab
**Owner:** Chetan · **Requires:** 3.2, 1.3

**1. Name** Analytics charts (mockup screen 12) + evaluation plan.
**2. Objective** Trend/type charts, plus an honest home for PS "tested on suspicious and legitimate scenarios".

**3. Tasks**
- [ ] Tab 1 **Alert analytics:** Fraud Patterns Trend (weekly, 5 pattern series) + Alerts by Type donut (percentages computed)
- [ ] Tab 2 **Evaluation:** metric definitions, baselines B0–B4, ablation rows, banner "Evaluation pending. Results are produced in the next build phase"; values only if `status == MEASURED`
- [ ] Unknown status → error panel; test-only `metrics_measured.sample.json` under `src/test/` (never served)

**4. Files** `src/pages/Analytics.tsx`, `src/components/analytics/*`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T5.3-01 | Weekly buckets | — | Compute | 5 buckets; sums = type counts | ⬜ |
| T5.3-02 | Donut percentages | — | Compute | Sum 100 | ⬜ |
| T5.3-03 | Pending state | Real metrics | Render | Banner; value cells "—" | ⬜ |
| T5.3-04 | **No numbers when pending** | — | Scan value cells | No digits/% | ⬜ |
| T5.3-05 | Measured (test only) | Sample | Render | Values shown | ⬜ |
| T5.3-06 | Unknown status | Mutated | Render | Error panel | ⬜ |
| T5.3-07 | Sample not shipped | — | Check `public/fixtures` | Absent | ⬜ |

**7. Verification** VQ vs screen 12 · - [ ] wording uses PS terms: "detection accuracy", "false-positive rate"
**8. Completion** Charts computed; evaluation is honestly pending.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(analytics): pattern trend, type donut and evaluation-pending tab [M5.3]"
git push origin feat/m5-3-analytics
```
**10. Rollback** R-B / R-C.

---

## M5.4 — Reports & Export
**Owner:** Shanteshwar · **Requires:** 5.1, 4.2–4.6

**1. Name** Report generator (mockup screen 13) with tamper-evident export.
**2. Objective** PS outcome: evidence export for reviewers, verifiable.

**3. Tasks**
- [ ] Form: Report Type (Investigation / Alert summary), alert selector, date range, section checkboxes (Alert Summary, Transaction Graph, Timeline, Employee Activity, Evidence & Authorization, But-for Analysis, Supporting Documents), **Generate Report**
- [ ] **Report Preview** panel ("KHOJI Investigation Report") using the same components; graph as PNG snapshot (`cy.png()`), fallback to an edge table if capture fails
- [ ] Downloads: hashed JSON pack (`stableStringify`, SHA-256 per item + chained manifest hash via Web Crypto); **Verify pack** button; Print / Save-as-PDF view with print CSS
- [ ] Report includes the no-intent statement and "precomputed" labels

**4. Files** `src/pages/Reports.tsx`, `src/components/reports/*`, `src/lib/{hash,stableStringify}.ts`, `src/print.css`, tests
**5. Guidance** Web Crypto is built into browsers. In Vitest add `Object.defineProperty(globalThis,'crypto',{value: webcrypto})` from `node:crypto` in `setup.ts`. Print CSS avoids a PDF-library dependency.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T5.4-01 | Determinism | Same alert | Generate twice | Identical manifest hash | ⬜ |
| T5.4-02 | Key order | Swapped keys | `stableStringify` | Same output | ⬜ |
| T5.4-03 | **Tamper** | Exported pack | Alter one character, Verify | FAIL naming the item | ⬜ |
| T5.4-04 | Unicode | ₹ in content | Export + verify | Pass | ⬜ |
| T5.4-05 | Section toggles | — | Untick "But-for" | Section absent from preview and pack | ⬜ |
| T5.4-06 | No alert selected | — | Generate | Validation message | ⬜ |
| T5.4-07 | PNG failure | Force error | Generate | Edge-table fallback, no crash | ⬜ |
| T5.4-08 | Print view | — | Open | No-intent + precomputed labels | ⬜ |
| T5.4-09 | Filename | — | Export | `KHOJI_report_<alert>_<yyyymmdd>.json` | ⬜ |

**7. Verification** VQ vs screen 13 · - [ ] PDF from browser opens · - [ ] exported files not in the repo
**8. Completion** Export and verification work; tampering detected.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(reports): report generator, hashed evidence pack with verify, print view [M5.4]"
git push origin feat/m5-4-reports
```
**10. Rollback** R-B / R-C.

### ✅ Phase 5 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 5.1–5.4 |
| Tests / Issues / Hash | (fill) |
| Verification | All 13 mockup screens work; five PS outcomes demonstrable (outcome 4 as a *plan*) |
| **Go/No-Go for Phase 6/7/8** | GO if the manual walkthrough of the full demo path passes. Build Phase 6 **only** if this holds |

`git tag -a phase-5-done -m "Phase 5 complete" && git push origin phase-5-done`

---

# PHASE 6 — Secondary Screens (SHOULD-build)

> **Gate:** build only if Phases 3–5 are complete and the demo path is stable. Otherwise leave these nav items on the "Not part of this build" placeholder.

## M6.1 — Employees List + Profile
**Owner:** Shanteshwar · **Requires:** 4.4
**1. Name** `/employees` table and `/employees/:id`. **2. Objective** Reuse the Employee Activity components outside an alert.
**3. Tasks** - [ ] table (ID, name, role, branch, misuse-signal count) - [ ] profile page reuses `EmployeeCard`, `ActivityTable`, `AccessRightsPanel` - [ ] "linked alerts" list
**4. Files** `src/pages/{Employees,EmployeeProfile}.tsx`, tests
**6. Tests**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T6.1-01 | List | Loaded | Render | 30 rows | ⬜ |
| T6.1-02 | Profile | E17 | Open | Same data as the alert tab | ⬜ |
| T6.1-03 | Unknown id | — | `/employees/NOPE` | Not-found | ⬜ |
| T6.1-04 | Regression | — | M4.4 tests | Pass | ⬜ |

**7. Verification** VQ against the mockup's table/card styling. **8. Completion** Pages reuse components with no duplication.
**9. Git**
```bash
git status
git add .
git commit-shanteshwar -m "feat(employees): employees list and profile reusing activity components [M6.1]"
git push origin feat/m6-1-employees
```
**10. Rollback** R-B / R-C.

## M6.2 — Transactions List + Settings
**Owner:** Rishi · **Requires:** 2.4
**1. Name** `/transactions` (search, filter by account/date, paginated) and `/settings` (data source display, link to Demo mode, prototype disclosure).
**3. Tasks** - [ ] transactions table across scenarios with links to the alert - [ ] settings page (read-only toggles; no secrets shown)
**4. Files** `src/pages/{Transactions,Settings}.tsx`, tests
**6. Tests**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T6.2-01 | List | Loaded | Render | All scenario transactions | ⬜ |
| T6.2-02 | Filter | — | By account | Only matching | ⬜ |
| T6.2-03 | Empty | — | No match | Empty state | ⬜ |
| T6.2-04 | Settings safe | — | Render | No env values or secrets displayed | ⬜ |

**7. Verification** VQ styling parity. **8. Completion** Both pages usable.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(ui): transactions list and settings page [M6.2]"
git push origin feat/m6-2-transactions-settings
```
**10. Rollback** R-B / R-C.

## M6.3 — Graph Explorer
**Owner:** Chetan · **Requires:** 4.2
**1. Name** `/graph-explorer`: pick a scenario, search a node, expand neighbours, fullscreen. **2. Objective** Reuse `MoneyGraph` with all accounts of a scenario.
**3. Tasks** - [ ] scenario selector - [ ] node search + highlight - [ ] link node → customer/employee page
**4. Files** `src/pages/GraphExplorer.tsx`, tests
**6. Tests**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T6.3-01 | Load | — | Choose S1 | Same elements as the alert graph | ⬜ |
| T6.3-02 | Search | — | Find "B-207" | Node highlighted | ⬜ |
| T6.3-03 | Unknown node | — | Search "zzz" | "No match" | ⬜ |
| T6.3-04 | Regression | — | M4.2 tests | Pass | ⬜ |

**7. Verification** Visual check. **8. Completion** Works for all FULL scenarios.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(graph): graph explorer reusing money-flow graph [M6.3]"
git push origin feat/m6-3-graph-explorer
```
**10. Rollback** R-B / R-C.

### ✅ Phase 6 Completion Checkpoint
Record milestones done/skipped, tests, hash. **Go/No-Go:** GO if regression suites for Phases 3–5 still pass. Tag: `phase-6-done` (or note "skipped by gate").

---

# PHASE 7 — Backend Bridge (Minimal)

## M7.1 — FastAPI Fixture API
**Owner:** Aryan · **Requires:** 0.3, 1.4

**1. Name** Read-only API serving validated fixtures.
**2. Objective** Establish the API contract the second half fills with real engines.

**3. Tasks**
- [ ] Endpoints: `GET /health`, `GET /api/core`, `GET /api/scenarios/{id}`, `GET /api/metrics`
- [ ] Validate **all** fixtures with pydantic at startup (fail fast, clear message)
- [ ] Scenario ids resolved **only** through the loaded index (never build file paths from input)
- [ ] CORS: only `http://localhost:5173`

**4. Files** `backend/app/{main,fixtures}.py`, `backend/tests/test_api.py`
**5. Guidance** Read from `frontend/public/fixtures/` (single source of truth). Client-side filtering stays in the frontend at this data size.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T7.1-01 | Core | — | GET /api/core | 200; 124 alerts | ⬜ |
| T7.1-02 | Scenario | — | GET /api/scenarios/S1 | 200; validates | ⬜ |
| T7.1-03 | Unknown | — | GET /api/scenarios/ZZ | 404 | ⬜ |
| T7.1-04 | **Path traversal** | — | `/api/scenarios/..%2F..%2Fetc` | 404; no file read | ⬜ |
| T7.1-05 | Bad fixture | Temp bad copy | Start app | Startup error naming file | ⬜ |
| T7.1-06 | CORS allowed/denied | — | Origin localhost:5173 / evil.example | Header present / absent | ⬜ |
| T7.1-07 | Metrics pending | — | GET /api/metrics | PENDING, no values | ⬜ |

**7. Verification** - [ ] `/docs` lists the endpoints
**8. Completion** API returns exactly the fixture contract, safely.
**9. Git**
```bash
git status
git add .
git commit-aryan -m "feat(api): read-only fixture API with startup validation, id whitelist, CORS [M7.1]"
git push origin feat/m7-1-fixture-api
```
**10. Rollback** R-B / R-C. The frontend keeps working in fixtures mode.

## M7.2 — Frontend API Mode + Fallback
**Owner:** Rishi · **Requires:** 7.1, 2.4

**1. Name** Switchable data source with safe fallback.
**2. Objective** UI reads the API, falling back to fixtures with a visible notice.

**3. Tasks** - [ ] `VITE_DATA_SOURCE=api|fixtures`, `VITE_API_BASE` - [ ] on API error/invalid response → fixtures + "Using offline fixtures" banner - [ ] validate API responses with the same zod schemas
**4. Files** `src/data/loader.ts`, `src/components/ui/FallbackBanner.tsx`, `.env.example`, tests

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T7.2-01 | API mode | API up | Load | Data via API (network tab) | ⬜ |
| T7.2-02 | API down | Stopped | Load | Banner; data shown | ⬜ |
| T7.2-03 | Invalid API data | Mock | Load | Fallback + logged error | ⬜ |
| T7.2-04 | Fixtures mode | Flag | Load | No API calls | ⬜ |
| T7.2-05 | **Regression** | — | Full Vitest suite (Phases 2–6) | All pass in both modes | ⬜ |

**7. Verification** - [ ] `.env.local` untracked · - [ ] both modes tried manually
**8. Completion** Both modes work; fallback is visible.
**9. Git**
```bash
git status
git add .
git commit-rishi -m "feat(data): API data source with validated fixture fallback [M7.2]"
git push origin feat/m7-2-api-mode
```
**10. Rollback** R-B / R-C. Before recording, set `VITE_DATA_SOURCE=fixtures` if in doubt.

### ✅ Phase 7 Completion Checkpoint
Record milestones, tests, hash. **Go/No-Go for Phase 8:** GO if all regression suites pass in both data modes. Tag `phase-7-done`.

---

# PHASE 8 — Demo Mode, E2E, Video

## M8.1 — Scripted Demo Mode + Playwright E2E
**Owner:** Chetan · **Requires:** Phases 3–5 (7 recommended)

**1. Name** Deterministic keyboard-driven walkthrough with automated E2E.
**2. Objective** The video is smooth and repeatable; regressions in the demo path are caught before recording.

**3. Tasks**
- [ ] `docs/demo-script.md` and `src/demo/demo-beats.json` (beats below); `/demo` route with controller: Space play/pause, →/← next/previous, R restart; `?hide=1` hides the controller for recording
- [ ] `npm install -D @playwright/test` and `npx playwright install chromium` (**why:** real-browser tests for canvas graph, downloads and routing that jsdom cannot cover)
- [ ] Config: `webServer` on 5173, viewport 1920×1080; E2E for the full path; per-screen screenshots to `test-results/` (ignored) for VQ

**Demo beats**

| # | Route / action | Narrator |
|---|---|---|
| 1 | `/login` → sign in | Rishi |
| 2 | `/dashboard`: KPIs, trend, donut (*"scripted seed data"*) | Chetan |
| 3 | `/alerts` → filter High → open ALT-2024-001 | Rishi |
| 4 | Overview: level + reasons (no score), related entities | Rishi |
| 5 | Transaction Graph: circular transfer, employee links | Chetan |
| 6 | Timeline: mobile change → cooldown override → beneficiary → hollow MFA | Chetan |
| 7 | Employee Activity: valid permission, misuse signals | Shanteshwar |
| 8 | Evidence: Tainted MFA, Control Path, missing CCTV, download | Rishi |
| 9 | But-for: toggle mobile change → FAIL (*"precomputed"*) | Aryan |
| 10 | Legitimate twin: divergence | Chetan |
| 11 | Reach exposure | Shanteshwar |
| 12 | S2 (payroll twin) and S3 (customer Profile Analysis) quick look | Chetan / Rishi |
| 13 | Assign → status → decision | Shanteshwar |
| 14 | Reports: generate, verify hash, print/PDF | Shanteshwar |
| 15 | Analytics › Evaluation: **pending** (state what will be measured) | Chetan |

**4. Files** `src/pages/Demo.tsx`, `src/demo/*`, `docs/demo-script.md`, `frontend/playwright.config.ts`, `frontend/e2e/demo.spec.ts`
**5. Guidance** No randomness anywhere. Beats advance only by keys or a fixed timer.

**6. Test Cases**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T8.1-01 | Beat navigation | Dev | → through all beats | Each shows its expected view | ⬜ |
| T8.1-02 | Keyboard | — | Space, ←, R | Pause / back / restart | ⬜ |
| T8.1-03 | E2E happy path | Playwright | `npx playwright test` | Login → … → report download → evaluation pending | ⬜ |
| T8.1-04 | Flakiness | — | Run E2E 3× | 3/3 pass | ⬜ |
| T8.1-05 | Guard in E2E | Signed out | Open `/alerts` | Redirect to login | ⬜ |
| T8.1-06 | Badge | — | Each beat | Prototype badge visible | ⬜ |
| T8.1-07 | Console clean | — | Listen | Zero errors | ⬜ |
| T8.1-08 | Fallback | API stopped, API mode | Run demo | Works with banner | ⬜ |
| T8.1-09 | Hidden controller | `?hide=1` | Render | Controller absent | ⬜ |

**7. Verification** - [ ] demo runs start-to-finish by keyboard only · - [ ] `playwright-report/`, `test-results/` untracked
**8. Completion** Path is automated, deterministic and green 3 times in a row.
**9. Git**
```bash
git status
git add .
git commit-chetan -m "feat(demo): scripted demo mode and Playwright E2E [M8.1]"
git push origin feat/m8-1-demo-e2e
```
**10. Rollback** R-B / R-C. Before recording you can always use R-D from `phase-5-done` or `phase-7-done`.

---

## M8.2 — Video Recording & Release Tag
**Owner:** Aryan (all four present) · **Requires:** 8.1

**1. Name** Record, review, publish, tag.
**2. Objective** A clear, honest video (length and format: confirm with organizers) tied to a tagged commit.

**3. Tasks**
- [ ] Final `./scripts/check.sh` + `npx playwright test` on `main`
- [ ] OBS: 1920×1080, 30 fps, MP4; full-screen browser; notifications off; other apps closed
- [ ] Rehearse twice using `docs/demo-script.md`; each member narrates their own beats
- [ ] Record; keep raw files **outside** the repo; review against the QA table; re-record if any item fails
- [ ] Upload (unlisted YouTube or Drive); add the link and "How to run" to `README.md`; tag `v0.5.0-video`

**6. Test Cases (video QA)**

| ID | Scenario | Preconditions | Steps | Expected | Status |
|---|---|---|---|---|---|
| T8.2-01 | PS outcomes | Recording | Watch | Graph+timeline, levels+reasons, evidence panel, case+export, evaluation plan all visible | ⬜ |
| T8.2-02 | Three PS patterns | — | Watch | Circular, splitting, profile mismatch each shown | ⬜ |
| T8.2-03 | Honesty | — | Watch/listen | Badge visible; narration says scripted/precomputed; evaluation pending | ⬜ |
| T8.2-04 | Privacy | — | Watch | No real emails/phones/tokens/notifications on screen | ⬜ |
| T8.2-05 | Format | Organizer rules | Check | Within required length/format | ⬜ |
| T8.2-06 | Legibility | — | Watch on a laptop | Text readable; clear audio | ⬜ |
| T8.2-07 | Reproducibility | Tag created | Fresh clone at tag → run demo | Same demo works | ⬜ |

**7. Verification** - [ ] all T8.2 pass · - [ ] README link works in a private window · - [ ] tag points to the recorded commit
**8. Completion** Video published; `v0.5.0-video` pushed; fresh-clone demo works.
**9. Git**
```bash
git switch main && git pull origin main && git switch -c chore/m8-2-release-notes
# edit README.md: add video link + "How to run the demo"
git status
git add README.md docs/demo-script.md docs/design/DEVIATIONS.md
git commit-aryan -m "docs(release): video link, run instructions, final deviations log [M8.2]"
git push origin chore/m8-2-release-notes
git switch main && git merge --no-ff chore/m8-2-release-notes -m "merge: M8.2 release notes"
./scripts/check.sh
git push origin main
git tag -a v0.5.0-video -m "50% build: video prototype"
git push origin v0.5.0-video
```
Do not commit recordings or exported packs.
**10. Rollback** Never move or delete a shared tag. Fix on a branch, merge, then tag `v0.5.1-video`. To reproduce the recorded state: `git switch -c review/v050 v0.5.0-video`.

### ✅ Phase 8 Completion Checkpoint

| Item | Record |
|---|---|
| Completed | 8.1, 8.2 |
| Tests | Unit + E2E (3/3) + video QA |
| Git hash / tag | `v0.5.0-video` → (fill) |
| **Go/No-Go for the second-half build** | GO when the video is accepted and all phase tags exist |

---

## 8. Final Release Checklist (v0.5.0-video)

### Functionality
- [ ] Login → Dashboard (computed KPIs, trend, donut, recent alerts, top patterns)
- [ ] Alerts list: tabs, filters, date range, 13 pages, CSV export
- [ ] Alert detail with 7 tabs; SUMMARY alerts gated correctly
- [ ] **No numeric risk score anywhere**
- [ ] Graph, vertical timeline (with Control Check tag), Employee Activity with P1–P10, Evidence tab with HOLLOW control path
- [ ] But-for: Remove (precomputed), Twin, Reach
- [ ] Cases, assignment, decision with rationale, notes; Customers with Profile Analysis; Analytics; Reports with verified hash
- [ ] Evaluation tab shows **pending**, no invented values

### Testing
- [ ] `./scripts/check.sh` green on `main`
- [ ] Playwright E2E 3/3
- [ ] TS ↔ Python contract parity; fixture and seed determinism
- [ ] Visual QA logged for all 13 screens; `DEVIATIONS.md` complete

### Security (prototype level)
- [ ] `git log --all -- .env .env.local` returns nothing
- [ ] Route guard, sign-out and corrupted-session tests pass
- [ ] API path-traversal and CORS tests pass
- [ ] No real personal data; phones masked; initials avatars only
- [ ] Documented: login is a UI gate; real auth/roles deferred

### Performance
- [ ] Interactions smooth at 1920×1080 on the recording laptop (manual; **no numeric target specified**)
- [ ] No console errors in E2E

### Deployment / Run
- [ ] Fresh clone at the tag: `npm ci`, venv + `pip install -r backend/requirements.txt`, `npm run dev` → demo runs
- [ ] README "How to run" tested by someone other than Aryan

### Documentation
- [ ] Technical doc (state names updated), data-contract, demo-script, both playbooks, DEVIATIONS present
- [ ] README states: prototype, scripted data, precomputed replay, evaluation pending

### Git Repository Cleanliness
- [ ] `git status` clean on `main`
- [ ] `git ls-files | grep -E "node_modules|\.venv|dist/|\.mp4|playwright-report"` returns nothing
- [ ] All phase tags and `v0.5.0-video` pushed
- [ ] `git shortlog -sne` shows exactly the four members' emails

---

## 9. What Comes Next (Remaining 50%)

| Phase | Content | Replaces |
|---|---|---|
| 9 | Real synthetic bank simulator + ground truth + held-out families | Hand-authored YAML |
| 10 | Hash-chained evidence store + versioned state (DuckDB) | Static JSON |
| 11 | Pattern engines (cycles, splitting, Isolation Forest) + explanation checker | Precomputed alerts |
| 12 | Authorization grader, taint/Hollow Pass, access-rights signals, identity resolver | Precomputed controls/signals |
| 13 | Connection Engine + real `replay()`, Reach, optional Repair | Precomputed variants |
| 14 | Evidence confidence + decision-table triage | Precomputed levels |
| 15 | Live API + **real authentication and role-based access tests** | Fixture API, demo login |
| 16 | Evaluation runner: baselines B0–B4, ablations, detection accuracy and false-positive rate → Evaluation tab `MEASURED` | "Evaluation pending" |
| 17 | Final demo and submission | v0.5 video |

---

## 10. Daily Command Cheat-Sheet

```bash
# Start a milestone
git switch main && git pull origin main && git switch -c feat/mX-Y-name

# Frontend
cd frontend && npm run dev
# Backend (Git Bash on Windows)
cd backend && source .venv/Scripts/activate && uvicorn app.main:app --reload --port 8000
# Rebuild fixtures after editing YAML
python scripts/build_fixtures.py && python scripts/build_seed.py
# All checks / E2E
./scripts/check.sh            # or: powershell -File scripts/check.ps1
cd frontend && npx playwright test
# Who committed what
git shortlog -sne && git log --format="%h %an %s" -10
```
