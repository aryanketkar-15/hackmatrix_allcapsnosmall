# KHOJI demo script (about 4 minutes)

Start the app (`npm run dev` in `frontend/`), open `http://localhost:5173/demo` and drive it with the keyboard.
Add `?hide=1` (`/demo?hide=1`) to hide the on-screen controller while recording.

| Key | Action |
|---|---|
| `→` / `←` | next / previous beat |
| `Space` | play / pause (auto-advance every 9 s, fixed timer, no randomness) |
| `R` | restart (signs out and returns to the login screen) |
| `Esc` | exit the demo |

Sign-in for the demo (public, non-secret, UI gate only): `priya.sharma` / `demo-only-123`. The demo signs in automatically when it leaves beat 1.

## Beats

| # | Screen | Narrator | Say |
|---|---|---|---|
| 1 | `/login` | Rishi | KHOJI links people, actions and money. Sign-in is a UI gate for the demo only. |
| 2 | `/dashboard` | Chetan | Every number is computed from **scripted seed data**: alerts, risk distribution, top patterns. |
| 3 | `/alerts?level=HIGH` | Rishi | Filter to High; open the hero alert ALT-2024-001. |
| 4 | Overview | Rishi | A risk **level with reasons**, never a single score. Derived facts and related entities. |
| 5 | Transaction Graph | Chetan | Circular transfer A → B → C → A; dashed links to the employee credentials. |
| 6 | Timeline | Chetan | Mobile change, cooling-period override, beneficiary added, then MFA passed on a tainted number. |
| 7 | Employee Activity | Shanteshwar | Valid permissions, misused. P1–P10 are signals, **not findings of intent**. |
| 8 | Evidence | Rishi | Tainted MFA, the hollow control path, missing CCTV, a real downloadable document. |
| 9 | But-for › Replay | Aryan | Toggle the mobile change: the path fails. This result is **precomputed** in the prototype. |
| 10 | But-for › Legitimate twin | Chetan | Same actions, different authorization: the divergence point. |
| 11 | But-for › Exposure | Shanteshwar | Other accounts in the same state before any transfer (scenario values, precomputed). |
| 12 | ALT-2024-002 twin | Chetan | Structuring after two limit raises vs a payout batch with a pre-dated mandate. |
| 13 | Customer C005 › Profile Analysis | Rishi | Observed inflow far above declared income; the profile edit that hid the mismatch. |
| 14 | ALT-2024-003 overview | Shanteshwar | Assign, move the status, record a decision (rationale is required). |
| 15 | Reports | Shanteshwar | Generate, download the hashed evidence pack, verify it (and see a tampered copy fail). |
| 16 | Analytics › Evaluation | Chetan | Evaluation is **pending**. This page states what will be measured and against which baselines. |

## Honesty checklist (say it out loud)

- The **Prototype · scripted scenario data** badge is on screen the whole time.
- Replay (Remove) and exposure (Reach) results are precomputed.
- No accuracy or false-positive figure exists yet: evaluation is pending.
- Language: "credential E17", "operational dependency". Never "culprit", "guilty" or "fraudster". No intent claims.
- Sign-in is a UI gate, not security.

## Recording

1920×1080, 30 fps, MP4, browser full screen, notifications off, other apps closed. Keep raw recordings **outside** the repo.
Automated check of the same path: `cd frontend && npx playwright test` (writes screenshots to `test-results/screens/`).
