# KHOJI — Financial Crime & Insider Risk Intelligence Platform

HackMatrix 5.0 · PCCOE Pune · Problem statement **FIN-04**.

KHOJI is an investigation platform that puts employee actions, access rights, authorizations, account-state changes, control
evaluations and money flows on one evidence-backed timeline. It surfaces circular transfers, transaction splitting and profile
mismatches, connects them to employee activity, and explains every alert (a risk **level** with reasons, never one opaque score).

> **This is the first-half prototype.** Read this before judging it:
> - All data is **scripted scenario and seed data**. It is not real bank data.
> - Replay ("Remove") and exposure ("Reach") results are **precomputed**, and labelled as such in the UI.
> - **Evaluation is pending.** No accuracy or false-positive figure exists yet; the Evaluation tab lists what will be measured.
> - Sign-in is a **UI gate** for the demo (public demo credentials). It is not security. Real authentication and roles come later.
> - Case workflow state lives in memory; reloading the page resets it.

## Run it

Requirements: Node 20+ and Python 3.11+.

```bash
cd frontend
npm ci
npm run dev          # http://localhost:5173
```

Demo sign-in: `priya.sharma` / `demo-only-123` (public, non-secret). Scripted walkthrough: open `/demo` (see `docs/demo-script.md`).

### Optional: fixture API

```bash
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --port 8000
# then in frontend/.env.local:  VITE_DATA_SOURCE=api   (falls back to bundled fixtures, with a visible banner, if the API is down)
```

### Rebuild the fixtures

```bash
python scripts/build_fixtures.py   # data/scenarios/*.yaml → frontend/public/fixtures/scenarios/*.json (validated, deterministic)
python scripts/build_seed.py       # 124 alerts, cases, employees, customers → frontend/public/fixtures/core.json
```

### Checks

```bash
./scripts/check.sh                 # backend tests, frontend typecheck + unit tests + build (Windows: scripts/check.ps1)
cd frontend && npx playwright test # end-to-end path in a real browser (needs: npx playwright install chromium)
```

## What is in the repo

| Path | What |
|---|---|
| `frontend/` | React + TypeScript + Tailwind investigator dashboard (13 screens from the mockup, plus Employees, Transactions, Graph Explorer, Settings) |
| `backend/` | FastAPI read-only fixture API; pydantic mirror of the shared data contract |
| `data/` | Scenario YAML (S1–S6 and twins), seed config, evaluation plan, contract samples |
| `scripts/` | Deterministic fixture and seed builders, checks, git identity aliases |
| `docs/` | Technical documentation (PDF), development playbook, data contract, demo script, design deviations |

## Screens

Login · Dashboard · Alerts · Alert detail (Overview, Transaction Graph, Timeline, Employee Activity, Evidence, But-for Analysis, Notes) ·
Cases · Customers and Profile Analysis · Analytics (with Evaluation plan) · Reports and hashed Evidence Pack (verify and tamper test) ·
Employees · Transactions · Graph Explorer · Settings. The mockup lives at `docs/design/khoji-ui-mockup.png`; intentional differences are in
`docs/design/DEVIATIONS.md`.

## The three ideas (as built in the prototype)

- **Hollow Pass** — a control that passed on an input set without customer-verified authorization is shown as `PASS · HOLLOW` in the Control Path.
- **Remove** — minimal-disabling-set replay: which recorded employee actions the money path depended on (necessary / jointly necessary / contributory / concealing). Precomputed here.
- **Legitimate twins and abstention** — each attack has a look-alike that stays explained, and missing evidence yields an **Inconclusive** alert that names the gap.

Language rule: outputs say "operational dependency under modelled controls" and never claim intent.

## Team

See `CONTRIBUTORS.md`. Commits are attributed to whoever wrote the work.
