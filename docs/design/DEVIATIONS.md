# Design deviations: mockup vs. built UI

The reference is `docs/design/khoji-ui-mockup.png`. Where the mockup conflicts with KHOJI's principles (explainable levels, no invented figures, no intent claims) the build deviates on purpose. Status shows what was actually done.

| # | Mockup shows | Decision | Status |
|---|---|---|---|
| C1 | Light theme | Followed (light, blue primary, Inter) | Done |
| C2 | "Risk Score 92/100" | **Removed.** A risk level chip plus reasons. The contract rejects any `riskScore` field (zod and pydantic) | Done, tested |
| C3 | Login footer "Secure" | "Evidence-backed · Explainable · Investigator-Focused"; sign-in is labelled a UI gate | Done |
| C4 | Whole attack in ~40 minutes | Kept the mockup times; added a **Control Check** event "Cooling period overridden at branch by credential E17, no independent checker" (a scenario assumption) | Done |
| C5 | Inconsistent amounts between screens | Fixtures are the single source of truth. Amount at risk, counts and first/last transaction are **derived** from the transactions (₹29,80,000 · 3 accounts · 2 employees · 7 transactions) | Done, tested |
| C6 | KPI figures with "% from last week" | Values are computed from seed data; week-over-week deltas are computed from dates and hidden when there is no prior data (Under Investigation has no delta) | Done |
| C7 | Four levels | Added **Near-miss** and **Explained**; DATA_GAP is shown as "Inconclusive" | Done |
| C8 | Green check on "NECESSARY" | Indigo/blue for dependency roles; green stays for "genuine/passed" | Done, tested |
| C9 | Timeline tags without controls | Added a fourth tag, **Control Check** (shows the Hollow Pass) | Done |
| C10 | Documents with fake sizes | Real generated JSON/CSV/TXT files; the displayed size is the real byte size | Done, tested |
| C11 | Photos, full phone numbers | Initials avatars; phones stored and shown masked only (`••••••210`) | Done, tested |
| C12 | Open / Under Review / Pending Evidence / Closed | Unified enum NEW → UNDER_REVIEW → ASSIGNED → INVESTIGATING ⇄ PENDING_EVIDENCE → DECIDED → CLOSED | Done, tested |
| C13 | No screen for Control Path, Twin, Reach, Scoreboard | Control Path → Evidence tab; Twin + Reach → But-for tab (segmented control); Scoreboard → Analytics › Evaluation | Done |
| C14 | Unreadable second button on Cases | Assumed **Export CSV** (to confirm) | Assumption |
| C15 | Monthly trend | Weekly buckets computed from the 30-day seed window | Done |
| C16 | Bank-building photo | Inline SVG skyline (no hotlinked image) | Done |
| C17 | Alert created at the same minute as the first transaction | Invariant: `alert.createdAt ≥ last transaction time` (builder rejects violations) | Done, tested |

## Additional decisions made while building

| # | Topic | Decision |
|---|---|---|
| D1 | Cases KPI cards | "My Cases · Assigned · Investigating · Pending Evidence · Closed" (all computed). The mockup's "Open / Under Review" cannot both be derived from the seed |
| D2 | Twins as alerts | S2-T, S3-T and the S4 sweep are the three INFO/Explained alerts; the S1 recovery twin is scenario-only (no alert, as there is nothing to alert on) |
| D3 | Graph layout | Authored node positions; x is stretched ×1.7 at draw time because the canvas is much wider than tall |
| D4 | Amount at risk | Outbound value (executed or attempted) from the victim customer's accounts, so a blocked near-miss still shows the attempted amount |
| D5 | Alert IDs | ALT-2024-001 is the hero; the other scenario alerts are 002–008 and the remaining seed alerts follow |
| D6 | Technical document §13 | The state names changed to the enum above; the PDF is not edited here. `docs/data-contract.md` is authoritative |
| D7 | Dates | The mockup's April 2024 window is kept; the fixture "as-of" time is 30 Apr 2024 18:00 IST (never `Date.now()`) |
