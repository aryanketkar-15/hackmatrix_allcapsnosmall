#!/usr/bin/env python
"""Deterministic seed: 124 alerts, cases, employees, customers -> frontend/public/fixtures/core.json.

All values are scripted scenario/seed data (design parameters), never measured results.
"""
from __future__ import annotations

import random
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone

import yaml

from khoji_build import (
    BuildError, OUT_DIR, ROOT, SCENARIO_OUT, build_all, derive_facts, dump_json, iso,
)

sys.path.insert(0, str(ROOT / "backend"))
from app.models import CoreFile  # noqa: E402

IST = timezone(timedelta(hours=5, minutes=30))
FIRST = ["Anil", "Bhavna", "Chirag", "Divya", "Farhan", "Gauri", "Harsh", "Isha", "Jayesh", "Kavita", "Lalit", "Manisha",
         "Nikhil", "Omkar", "Pooja", "Qadir", "Rekha", "Sameer", "Tanvi", "Uday", "Varun", "Waseem", "Yamini", "Zoya"]
LAST = ["Patil", "Shah", "Nair", "Reddy", "Kapoor", "Joshi", "Gupta", "Mishra", "Bhatt", "Khan", "Pillai", "Chavan",
        "Sinha", "Rao", "Desai", "Naik", "Kulkarni", "Thakur", "Yadav", "Banerjee"]
CITIES = ["Pune", "Mumbai", "Nashik", "Nagpur", "Kolhapur", "Satara", "Solapur", "Aurangabad", "Thane", "Sangli"]
OCCUPATIONS = ["Salaried employee", "Small-business owner", "Retired", "Teacher", "Shopkeeper", "Engineer", "Farmer", "Consultant"]

PERMISSIONS = ["Change contact details", "Add beneficiary", "Override cooling period", "Raise transaction limits",
               "Change alert preferences", "Edit customer profile", "Open accounts", "Approve changes"]
ROLE_PERMS = {
    "Customer Service": {0, 1, 2},
    "Relationship Manager": {0, 1, 3, 4, 5},
    "Operations Executive": {0, 1, 5, 6},
    "Teller": {1},
    "Branch Manager": {0, 1, 2, 3, 4, 5, 6, 7},
}
SIGNAL_TEXT = {"P2": "outside portfolio", "P3": "off-shift", "P9": "dormant-account targeting"}

# Scenario employee identities (synthetic).
NAMED_EMP = {
    "E17": ("Rohit Kumar", "Customer Service", "Main Branch", "Retail Banking"),
    "E22": ("Neha Sawant", "Operations Executive", "Branch 2", "Account Opening"),
    "E14": ("Sanjay Pawar", "Relationship Manager", "Branch 2", "Retail Banking"),
    "E05": ("Anita Lokhande", "Relationship Manager", "Branch 2", "Retail Banking"),
    "E11": ("Deepak Wagh", "Operations Executive", "Branch 3", "Customer Records"),
    "E19": ("Prakash Ghodke", "Customer Service", "Branch 3", "Retail Banking"),
    "E23": ("Suresh Jagtap", "Customer Service", "Main Branch", "Retail Banking"),
    "E09": ("Kavya Iyer", "Customer Service", "Main Branch", "Retail Banking"),
}
HERO_CUSTOMER = {"C001": ("Asha Rao", 67, "Retired", 600000, "Pune", "Individual"),
                 "C002": ("Kiran Patil", 58, "Retired", 720000, "Pune", "Individual"),
                 "C010": ("Mohan Salunkhe", 39, "Shopkeeper", 540000, "Thane", "Individual"),
                 "C011": ("Latika Rane", 34, "Consultant", 660000, "Thane", "Individual")}

TITLES = {
    "CIRCULAR_TRANSFER": ["Circular transfer detected", "Circular transfer with employee link", "Multi-hop loop across linked accounts"],
    "STRUCTURING": ["Transaction structuring detected", "Repeated just-below-threshold transfers"],
    "FAN_OUT": ["Fan-out money movement", "Rapid distribution to many beneficiaries"],
    "FAN_IN": ["Fan-in money movement", "Many small credits consolidated"],
    "PASS_THROUGH": ["Pass-through transaction pattern", "Funds in and out within hours"],
    "BENEFICIARY_MANIPULATION": ["Beneficiary added shortly before transfer", "Beneficiary change followed by large payment"],
    "DORMANT_ACTIVATION": ["Dormant account activated", "Reactivation followed by outward transfers"],
    "PROFILE_MISMATCH": ["Customer profile mismatch", "Activity inconsistent with declared income"],
    "INSIDER_ACTIVITY": ["Employee abnormal activity", "Unusual access pattern for a role"],
}
SUMMARY = {
    "CIRCULAR_TRANSFER": "Funds move through {n} accounts and return towards the origin within a short window.",
    "STRUCTURING": "Several transfers sit just below the reporting threshold within a short window.",
    "FAN_OUT": "A single credit is split across many beneficiaries within hours.",
    "FAN_IN": "Many small credits from unrelated sources are consolidated into one account.",
    "PASS_THROUGH": "Incoming funds leave the account within hours with little balance retained.",
    "BENEFICIARY_MANIPULATION": "A beneficiary was added shortly before a large payment to it.",
    "DORMANT_ACTIVATION": "A long-dormant account was reactivated and immediately moved funds out.",
    "PROFILE_MISMATCH": "Observed flows are far above the customer's declared income profile.",
    "INSIDER_ACTIVITY": "A staff credential shows unusual activity compared with peers in the same role.",
}
REASONS = {
    "CIRCULAR_TRANSFER": "Time-respecting loop closes within the fast window",
    "STRUCTURING": "Amounts cluster just below the configured threshold",
    "FAN_OUT": "Outgoing fan-out to many new beneficiaries",
    "FAN_IN": "Incoming fan-in from many unrelated sources",
    "PASS_THROUGH": "Pass-through ratio close to 1 within hours",
    "BENEFICIARY_MANIPULATION": "Beneficiary added shortly before the transfer",
    "DORMANT_ACTIVATION": "Dormant account reactivated before outward transfers",
    "PROFILE_MISMATCH": "Observed inflow far above the declared income band",
    "INSIDER_ACTIVITY": "Actions rare for the credential's role and shift",
}
INDICATORS = {
    "CIRCULAR_TRANSFER": ["Circular transfer pattern detected", "Transactions across multiple accounts"],
    "STRUCTURING": ["Amounts just below the reporting threshold", "Repeated transfers within a short window"],
    "FAN_OUT": ["Many new beneficiaries", "Rapid outward distribution"],
    "FAN_IN": ["Many unrelated sources", "Consolidation into one account"],
    "PASS_THROUGH": ["Funds pass through within hours", "Low retained balance"],
    "BENEFICIARY_MANIPULATION": ["Beneficiary added before transfer", "New payee with no history"],
    "DORMANT_ACTIVATION": ["Account dormant for over a year", "Outward transfers after reactivation"],
    "PROFILE_MISMATCH": ["Flows above declared income", "History break in account behaviour"],
    "INSIDER_ACTIVITY": ["Action rare for the role", "Activity outside the assigned portfolio"],
}
DECISIONS = [("FALSE_POSITIVE", 12), ("EXTERNAL_FRAUD", 6), ("INSIDER_CONNECTED", 5), ("PROCESS_VIOLATION", 4),
             ("CUSTOMER_DISPUTE", 3), ("INCONCLUSIVE", 4)]
RATIONALE = {
    "FALSE_POSITIVE": "Explained by pre-dated business evidence on file; no employee connection found.",
    "EXTERNAL_FRAUD": "Customer credentials were used externally; no operational dependency on staff actions.",
    "INSIDER_CONNECTED": "Recorded path depended on staff actions without customer evidence; referred to vigilance.",
    "PROCESS_VIOLATION": "A control was bypassed by procedure; recommended a checker-independence review.",
    "CUSTOMER_DISPUTE": "Customer disputes the transactions; routed to the dispute team with the evidence pack.",
    "INCONCLUSIVE": "Evidence is insufficient to determine dependency; missing records requested.",
}


def dt(s: str) -> datetime:
    return datetime.fromisoformat(iso(s))


def fmt(d: datetime) -> str:
    return d.astimezone(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")


def initials(name: str) -> str:
    parts = [p for p in name.replace("Pvt Ltd", "").replace("Ltd", "").split() if p]
    return "".join(p[0] for p in parts[:2]).upper()


def masked_phone(rng) -> str:
    return "•" * 6 + f"{rng.randint(100, 999)}"


def pick_multiset(counts: dict, rng: random.Random) -> list:
    items = [k for k, v in counts.items() for _ in range(v)]
    rng.shuffle(items)
    return items


def main() -> int:
    cfg = yaml.safe_load((ROOT / "data" / "seed.yaml").read_text(encoding="utf-8"))
    rng = random.Random(cfg["seed"])
    as_of = dt(cfg["asOf"])
    yamls, scen_json = build_all()
    import json
    scen = {sid: json.loads(t) for sid, t in scen_json.items()}
    ymap = {y["id"]: y for y in yamls}

    # ---------- employees ----------
    signals_by_emp: dict[str, list[str]] = {}
    for s in scen.values():
        for ins in s["insiders"]:
            signals_by_emp.setdefault(ins["employeeId"], [])
            signals_by_emp[ins["employeeId"]] = sorted(set(signals_by_emp[ins["employeeId"]]) | set(ins["signals"]))
    branches = ["Main Branch", "Branch 2", "Branch 3"]
    roles = list(ROLE_PERMS)
    employees = []
    used = set(NAMED_EMP[e][0] for e in NAMED_EMP)
    for n in range(1, cfg["totals"]["employees"] + 1):
        eid = f"E{n:02d}"
        if eid in NAMED_EMP:
            name, role, branch, dept = NAMED_EMP[eid]
        else:
            while True:
                name = f"{rng.choice(FIRST)} {rng.choice(LAST)}"
                if name not in used:
                    used.add(name)
                    break
            role = rng.choice(roles)
            branch = rng.choice(branches)
            dept = rng.choice(["Retail Banking", "Customer Records", "Account Opening", "Operations"])
        sigs = signals_by_emp.get(eid, [])
        perms = [{"name": p, "held": i in ROLE_PERMS[role]} for i, p in enumerate(PERMISSIONS)]
        # scenario employees hold the permissions the scenario shows them using (valid access)
        for ins in [i for s in scen.values() for i in s["insiders"] if i["employeeId"] == eid]:
            for a in ins["actions"]:
                need = {"Changed": 0, "Added": 1, "Overrode": 2, "Raised": 3, "Disabled": 4, "Edited": 5, "Opened": 6,
                        "Approved": 7, "Created": None}.get(a["action"].split()[0])
                if need is not None:
                    perms[need]["held"] = True
        activities = []
        for ins in [i for s in scen.values() for i in s["insiders"] if i["employeeId"] == eid]:
            for a in ins["actions"]:
                activities.append({"at": a["at"], "action": a["action"], "account": a["account"].replace("-", ""),
                                   "channel": "Branch Terminal", "location": branch})
        while len(activities) < 8:
            day = rng.randint(1, 29)
            when = datetime(2024, 4, day, rng.randint(9, 17), rng.randint(0, 59), tzinfo=IST)
            act = rng.choice(["Login", "Viewed Account", "Changed Limit", "Viewed Account", "Updated Address", "Login"])
            acct = "-" if act == "Login" else f"D{rng.randint(100, 199)}"
            activities.append({"at": fmt(when), "action": act, "account": acct, "channel": "Branch Terminal", "location": branch})
        activities.sort(key=lambda a: a["at"], reverse=True)
        overall = "High" if len(sigs) >= 3 else "Medium" if sigs else "Low"
        employees.append({
            "id": eid, "name": name, "initials": initials(name), "role": role, "branch": branch, "department": dept,
            "status": "On leave" if eid == "E30" else "Active",
            "portfolio": f"{rng.choice(['Retail', 'Corporate', 'Senior-citizen'])} accounts · {branch}" if eid not in NAMED_EMP else f"Retail accounts · {branch}",
            "permissions": perms,
            "activities": activities[:12],
            "behaviour": {
                "unusualTime": f"{3 if 'P3' in sigs else 0} events outside shift hours",
                "outsidePortfolio": f"{5 if 'P2' in sigs else 0} accounts outside assigned portfolio",
                "highRisk": f"{2 if sigs else 0} sensitive changes",
                "overall": overall,
            },
            "signalCount": len(sigs),
        })

    # ---------- customers & accounts ----------
    scen_customers = {}
    for y in yamls:
        if y.get("customer"):
            scen_customers[y["customer"]["id"]] = y["customer"]
    months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
    customers, accounts = [], []
    scen_account_nodes = {n["id"]: n for s in scen.values() for n in s["nodes"] if n["kind"] == "account"}
    cust_of_account = {}
    for sid, s in scen.items():
        for a in s["victimAccountIds"]:
            cust_of_account[a] = s["customerId"]
    cust_of_account.update({"B-207": "C010", "C-311": "C011", "A-008": "C007", "A-009": "C007", "A-118": "C012",
                            "A-114": "C013", "A-131": "C014", "A-146": "C015"})
    for a in ("A-007", "A-008", "A-009"):
        cust_of_account[a] = "C007"
    reach_accounts = {r["accountId"]: r for s in scen.values() for r in s["reach"]}

    acct_by_cust: dict[str, list[str]] = {}
    for aid, cid in cust_of_account.items():
        acct_by_cust.setdefault(cid, []).append(aid)

    for n in range(1, cfg["totals"]["customers"] + 1):
        cid = f"C{n:03d}"
        y = scen_customers.get(cid)
        if y:
            name, age, occ, income, loc = y["name"], y["age"], y["occupation"], y["annualIncome"], y["location"]
            ctype = y.get("type", "Individual")
        elif cid in HERO_CUSTOMER:
            name, age, occ, income, loc, ctype = HERO_CUSTOMER[cid]
        else:
            name = f"{rng.choice(FIRST)} {rng.choice(LAST)}"
            age, occ = rng.randint(24, 78), rng.choice(OCCUPATIONS)
            income, loc, ctype = rng.choice([360000, 480000, 720000, 960000, 1500000]), rng.choice(CITIES), "Individual"
        if y and y.get("monthlyFlows"):
            flows = [{"month": m, "inflow": i, "outflow": o} for m, i, o in y["monthlyFlows"]]
        else:
            base = max(income // 12, 20000)
            flows = []
            for m in months:
                inflow = int(base * rng.uniform(0.8, 1.15) / 1000) * 1000
                flows.append({"month": m, "inflow": inflow, "outflow": int(inflow * rng.uniform(0.75, 0.98) / 1000) * 1000})
        # C001 (hero): dormant retired customer -> low flows
        if cid == "C001":
            flows = [{"month": m, "inflow": 30000 + 2000 * i, "outflow": 26000 + 1500 * i} for i, m in enumerate(months)]
        acct_ids = acct_by_cust.get(cid) or [f"D-{100 + n:03d}"]
        for aid in acct_ids:
            node = scen_account_nodes.get(aid)
            accounts.append({
                "id": aid, "customerId": cid, "type": "Current" if ctype == "Business" else "Savings",
                "balance": node["balance"] if node and "balance" in node else rng.randint(20, 900) * 1000,
                "openedAt": fmt(datetime(2019 + rng.randint(0, 4), rng.randint(1, 12), rng.randint(1, 28), 11, 0, tzinfo=IST)),
                "dormant": aid in ("A-001", "A-011") or aid in reach_accounts,
            })
        customers.append({
            "id": cid, "name": name, "initials": initials(name), "type": ctype,
            "kycRisk": "High" if cid in ("C005",) else "Medium" if cid in ("C003", "C008", "C009") else "Low",
            "verified": True, "age": age, "occupation": occ, "annualIncome": income, "location": loc,
            "maskedPhone": masked_phone(rng), "accountIds": acct_ids, "monthlyFlows": flows,
            "counterpartyCount": rng.randint(3, 15) if not y else {"C005": 9, "C006": 4}.get(cid, rng.randint(3, 15)),
            "explanation": (y or {}).get("explanation"),
            "profileEdit": ({**y["profileEdit"], "at": iso(y["profileEdit"]["at"])} if y and y.get("profileEdit") else None),
        })
    # external counterparties
    for s in scen.values():
        for bid in s["beneficiaryIds"]:
            if not any(a["id"] == bid for a in accounts):
                accounts.append({"id": bid, "customerId": None, "type": "External", "balance": 0,
                                 "openedAt": fmt(datetime(2022, 1, 1, tzinfo=IST)), "dormant": False})
    for aid in reach_accounts:  # ensure reach accounts exist
        if not any(a["id"] == aid for a in accounts):
            raise BuildError(f"reach account {aid} missing from accounts")

    # ---------- alerts ----------
    alerts = []
    scenario_alerts = [(y, scen[y["id"]]) for y in yamls if y.get("alert")]
    scen_levels = Counter(); scen_status = Counter(); scen_types = Counter()
    for y, s in scenario_alerts:
        a = y["alert"]
        scen_levels[s["level"]] += 1
        scen_status[a["status"]] += 1
        scen_types[a["type"]] += 1
        node_ids = [n["id"] for n in s["nodes"] if n["kind"] == "account"]
        alerts.append({
            "id": a["id"], "title": a["title"], "level": s["level"], "type": a["type"], "status": a["status"],
            "createdAt": iso(a["createdAt"]), "closedAt": iso(a["closedAt"]) if a.get("closedAt") else None,
            "assignedTo": a.get("assignedTo"), "summary": " ".join(a["summary"].split()),
            "reasons": a["reasons"], "riskIndicators": a["riskIndicators"],
            "evidenceConfidence": a["evidenceConfidence"], "detailLevel": "FULL", "scenarioId": s["id"],
            "entityRefs": {"accountIds": node_ids, "employeeIds": s["employeeIds"], "customerIds": s["customerIds"],
                           "beneficiaryIds": s["beneficiaryIds"]},
            "listFacts": derive_facts(s),
            "evidenceSummary": s["evidenceSummary"],
        })

    def remaining(target: dict, used: Counter) -> dict:
        rem = {k: v - used.get(k, 0) for k, v in target.items()}
        if any(v < 0 for v in rem.values()):
            raise BuildError(f"scenario alerts exceed seed target: {rem}")
        return rem

    n_rest = cfg["totals"]["alerts"] - len(alerts)
    levels = pick_multiset(remaining(cfg["levels"], scen_levels), rng)
    statuses = pick_multiset(remaining(cfg["statuses"], scen_status), rng)
    types = pick_multiset(remaining(cfg["types"], scen_types), rng)
    assert len(levels) == len(statuses) == len(types) == n_rest, (len(levels), len(statuses), len(types), n_rest)
    investigators = [u["name"] for u in cfg["investigators"]]
    week_start = as_of - timedelta(days=cfg["closedWithinLastDays"])
    hero_created = dt("2024-04-30 10:50")
    next_num = 9
    seen_dates = []
    for lvl, st, ty in zip(levels, statuses, types):
        aid = f"ALT-2024-{next_num:03d}"; next_num += 1
        # more alerts in the last week than the week before (dashboard deltas are computed, not typed)
        if rng.random() < 0.34:
            created = week_start + timedelta(minutes=rng.randint(0, int((hero_created - week_start).total_seconds() // 60) - 1))
        else:
            created = dt(cfg["windowStart"]) + timedelta(minutes=rng.randint(0, int((week_start - dt(cfg["windowStart"])).total_seconds() // 60)))
        closed = None
        if st == "CLOSED":
            lo = max(created, week_start) + timedelta(minutes=30)
            hi = as_of
            if lo >= hi:
                created = week_start - timedelta(hours=6); lo = week_start + timedelta(minutes=30)
            closed = lo + timedelta(minutes=rng.randint(0, int((hi - lo).total_seconds() // 60)))
        assigned = None if st in ("NEW", "UNDER_REVIEW") else rng.choice(investigators)
        n_acc = rng.randint(1, 4); n_emp = rng.choice([0, 0, 1, 1, 2, 3]); n_ben = rng.randint(0, 3); n_tx = rng.randint(2, 9)
        first = created - timedelta(hours=rng.randint(2, 30))
        last = created - timedelta(minutes=rng.randint(15, 90))
        if last < first:
            last = first + timedelta(minutes=45)
        amount = rng.randint(2, 70) * 50000
        acc_pool = [a["id"] for a in accounts if a["type"] != "External"]
        rng.shuffle(acc_pool)
        emp_ids = rng.sample([e["id"] for e in employees], n_emp)
        title = rng.choice(TITLES[ty])
        if "employee link" in title and n_emp == 0:
            title = TITLES[ty][0]
        reasons = [REASONS[ty]]
        if n_emp:
            reasons.append("Staff credential connected to the account state used by the transactions")
        if lvl == "DATA_GAP":
            reasons = ["A critical evidence link is missing; the alert abstains until logs arrive"]
        if lvl == "NEAR_MISS":
            reasons = ["Insider-connected attempt blocked by a control that held"]
        conf = {"HIGH": rng.choice(["HIGH", "MEDIUM"]), "MEDIUM": rng.choice(["MEDIUM", "LOW"]), "WATCH": "LOW",
                "DATA_GAP": "INSUFFICIENT", "NEAR_MISS": "MEDIUM", "INFO": "HIGH"}[lvl]
        missing = lvl == "DATA_GAP"
        ev = [
            {"key": "customer-request", "label": "Customer Request", "status": rng.choice(["NOT_FOUND", "FOUND"]) if not missing else "MISSING", "detail": "Customer request check for the recorded state changes."},
            {"key": "employee-authorization", "label": "Employee Authorization", "status": rng.choice(["MISSING", "FOUND"]) if n_emp else "FOUND", "detail": "Independent approval check."},
            {"key": "mfa-verification", "label": "MFA Verification", "status": "MISSING" if missing else rng.choice(["AVAILABLE", "TAINTED"] if n_emp else ["AVAILABLE"]), "detail": "One-time-password delivery and verification record."},
            {"key": "system-logs", "label": "System Logs", "status": "AVAILABLE", "detail": "Core-banking logs retrieved."},
            {"key": "video-evidence", "label": "Video Evidence", "status": "NOT_AVAILABLE", "detail": "Branch CCTV not configured for this terminal."},
        ]
        alerts.append({
            "id": aid, "title": title, "level": lvl, "type": ty, "status": st,
            "createdAt": fmt(created), "closedAt": fmt(closed) if closed else None, "assignedTo": assigned,
            "summary": SUMMARY[ty].format(n=n_acc + 1), "reasons": reasons,
            "riskIndicators": [{"text": t, "severity": "high" if i == 0 and lvl == "HIGH" else "medium"} for i, t in enumerate(INDICATORS[ty])],
            "evidenceConfidence": conf, "detailLevel": "SUMMARY",
            "entityRefs": {"accountIds": acc_pool[:n_acc], "employeeIds": sorted(emp_ids),
                           "customerIds": sorted(rng.sample([c["id"] for c in customers], 1)),
                           "beneficiaryIds": [f"X-{rng.randint(100, 199)}" for _ in range(n_ben)]},
            "listFacts": {"amountAtRisk": amount, "accountsCount": n_acc, "employeesCount": n_emp, "customersCount": 1,
                          "beneficiariesCount": n_ben, "transactionsCount": n_tx, "firstTxnAt": fmt(first), "lastTxnAt": fmt(last)},
            "evidenceSummary": ev,
        })
        seen_dates.append(created)

    alerts.sort(key=lambda a: a["createdAt"], reverse=True)

    # ---------- cases ----------
    cases = []
    case_alerts = sorted([a for a in alerts if a["status"] in ("ASSIGNED", "INVESTIGATING", "PENDING_EVIDENCE", "DECIDED", "CLOSED")],
                         key=lambda a: a["createdAt"])
    dec_pool = [d for d, w in DECISIONS for _ in range(w)]
    for i, a in enumerate(case_alerts, start=1):
        decision = None
        if a["status"] == "CLOSED":
            dtype = "FALSE_POSITIVE" if a["level"] == "INFO" else rng.choice(dec_pool)
            decision = {"type": dtype, "rationale": RATIONALE[dtype], "at": a["closedAt"], "by": a["assignedTo"] or "Priya Sharma"}
        cases.append({
            "id": f"CASE-{i:03d}", "alertId": a["id"],
            "title": a["title"].replace("detected", "investigation") if "detected" in a["title"] else f"Review: {a['title']}",
            "priority": {"HIGH": "High", "MEDIUM": "Medium"}.get(a["level"], "Low"),
            "status": a["status"], "assignedTo": a["assignedTo"], "createdAt": a["createdAt"], "decision": decision,
        })

    scenario_index = [{"id": y["id"], "alertId": (y.get("alert") or {}).get("id"), "title": y["title"], "kind": y["kind"],
                       "file": f"scenarios/{y['id'].lower()}.json"} for y in yamls]

    core = {
        "meta": {"asOf": fmt(as_of), "windowStart": iso(cfg["windowStart"]), "windowEnd": iso(cfg["windowEnd"]), "seed": cfg["seed"]},
        "users": cfg["investigators"], "employees": employees, "customers": customers, "accounts": accounts,
        "alerts": alerts, "cases": cases, "scenarios": scenario_index,
    }
    CoreFile.model_validate(core)
    # cross-references
    emp_ids = {e["id"] for e in employees}; cust_ids = {c["id"] for c in customers}; acc_ids = {a["id"] for a in accounts}
    for a in alerts:
        for e in a["entityRefs"]["employeeIds"]:
            if e not in emp_ids:
                raise BuildError(f"{a['id']}: unknown employee {e}")
        for c in a["entityRefs"]["customerIds"]:
            if c not in cust_ids:
                raise BuildError(f"{a['id']}: unknown customer {c}")
        for x in a["entityRefs"]["accountIds"]:
            if x not in acc_ids:
                raise BuildError(f"{a['id']}: unknown account {x}")
    if len({a["id"] for a in alerts}) != len(alerts):
        raise BuildError("duplicate alert ids")
    dump_json(core, OUT_DIR / "core.json")
    print(f"built core.json: {len(alerts)} alerts, {len(cases)} cases, {len(employees)} employees, {len(customers)} customers")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except BuildError as e:
        print(f"BUILD ERROR: {e}", file=sys.stderr)
        sys.exit(1)
