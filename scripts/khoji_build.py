"""Shared helpers for the KHOJI fixture builders (scenarios YAML -> validated deterministic JSON)."""
from __future__ import annotations

import itertools
import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SCENARIO_DIR = ROOT / "data" / "scenarios"
OUT_DIR = ROOT / "frontend" / "public" / "fixtures"
SCENARIO_OUT = OUT_DIR / "scenarios"

sys.path.insert(0, str(ROOT / "backend"))
from app.models import Scenario, MetricsFile  # noqa: E402

IST = "+05:30"
TEN_DIGITS = re.compile(r"(?<!\d)\d{10}(?!\d)")


class BuildError(Exception):
    """Raised for any authoring / invariant problem; message names the offending item."""


def iso(value: str) -> str:
    """'2024-04-30 09:02' -> '2024-04-30T09:02:00+05:30' (already-ISO strings pass through)."""
    v = str(value).strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?", v):
        v = v.replace(" ", "T")
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", v):
            v += ":00"
        if not re.search(r"(Z|[+-]\d{2}:?\d{2})$", v):
            v += IST
        return v
    raise BuildError(f"bad timestamp: {value!r}")


def dump_json(obj, path: Path) -> str:
    text = json.dumps(obj, ensure_ascii=False, indent=1) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")
    return text


def load_yaml_files() -> list[dict]:
    files = sorted(SCENARIO_DIR.glob("s*.yaml"))
    return [yaml.safe_load(f.read_text(encoding="utf-8")) | {"_file": f.name} for f in files]


def _scan_phone_numbers(obj, where: str) -> None:
    if isinstance(obj, str):
        if TEN_DIGITS.search(obj):
            raise BuildError(f"unmasked 10-digit number in {where}: {obj[:60]!r}")
    elif isinstance(obj, dict):
        for k, v in obj.items():
            _scan_phone_numbers(v, f"{where}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _scan_phone_numbers(v, f"{where}[{i}]")


def derive_replay(rp: dict, timeline: list[dict]) -> dict:
    """Minimal-disabling-set semantics: roles and every subset's outcome are derived, not typed in."""
    order = {e["id"]: i for i, e in enumerate(timeline)}
    at = {e["id"]: e["at"] for e in timeline}
    cand_ids = [c["id"] for c in rp["candidates"]]
    sets = [frozenset(s) for s in rp["disablingSets"]]
    for s in sets:
        for cid in s:
            if cid not in cand_ids:
                raise BuildError(f"disabling set references unknown candidate {cid}")

    candidates = []
    for c in rp["candidates"]:
        if any(s == {c["id"]} for s in sets):
            role = "NECESSARY"
        elif any(c["id"] in s and len(s) >= 2 for s in sets):
            role = "JOINTLY_NECESSARY"
        else:
            role = c.get("declaredRole") or "CONTRIBUTORY"
        for ev in [c["eventId"], *c["dependents"]]:
            if ev not in order:
                raise BuildError(f"replay candidate {c['id']} references unknown event {ev}")
        candidates.append({**c, "declaredRole": c.get("declaredRole"), "role": role})

    for ev in rp["pathEventIds"]:
        if ev not in order:
            raise BuildError(f"pathEventIds references unknown event {ev}")

    by_id = {c["id"]: c for c in candidates}
    variants = []
    for size in range(len(cand_ids) + 1):
        for combo in itertools.combinations(cand_ids, size):
            removed = set(combo)
            fail = any(s <= removed for s in sets)
            events = {by_id[c]["eventId"] for c in combo}
            for c in combo:
                events |= set(by_id[c]["dependents"])
            if fail:
                earliest = min(at[by_id[c]["eventId"]] for c in combo)
                events |= {e for e in rp["pathEventIds"] if at[e] >= earliest}
            variants.append({
                "removed": list(combo),
                "outcome": "FAIL" if fail else "PASS",
                "cascadeEventIds": sorted(events, key=lambda e: order[e]),
            })

    for c in candidates:  # T1.2-07 consistency: NECESSARY => single removal FAIL; CONCEALING => PASS
        single = next(v for v in variants if v["removed"] == [c["id"]])
        if c["role"] == "NECESSARY" and single["outcome"] != "FAIL":
            raise BuildError(f"replay: {c['id']} is NECESSARY but single removal passes")
        if c["role"] == "CONCEALING" and single["outcome"] != "PASS":
            raise BuildError(f"replay: {c['id']} is CONCEALING but single removal fails")

    return {
        "targetLabel": rp["targetLabel"],
        "candidates": candidates,
        "disablingSets": [list(s) for s in rp["disablingSets"]],
        "coverage": rp["coverage"],
        "steps": rp["steps"],
        "variants": variants,
        "pathEventIds": rp["pathEventIds"],
    }


def build_scenario(y: dict) -> dict:
    sid = y["id"]
    d: dict = {
        "id": sid,
        "alertId": (y.get("alert") or {}).get("id"),
        "kind": y["kind"],
        "twinOf": y.get("twinOf"),
        "level": y["level"],
        "title": y["title"],
        "customerId": y.get("customerId"),
        "victimAccountIds": y.get("victimAccountIds", []),
        "nodes": y["nodes"],
        "transactions": [{**t, "at": iso(t["at"])} for t in y["transactions"]],
        "timeline": [],
        "controls": y.get("controls", []),
        "evidenceSummary": y["evidenceSummary"],
        "documents": y.get("documents") or [],
        "connections": y.get("connections") or [],
        "pathSteps": y.get("pathSteps") or [],
        "insiders": [],
        "replay": None,
        "reach": y.get("reach") or [],
        "employeeIds": y.get("employeeIds", []),
        "beneficiaryIds": y.get("beneficiaryIds", []),
        "customerIds": y.get("customerIds", []),
        "explanation": y.get("explanation"),
        "divergenceNote": y.get("divergenceNote"),
    }

    timeline = sorted(({**e, "at": iso(e["at"])} for e in y["timeline"]), key=lambda e: (e["at"]))
    d["timeline"] = timeline
    ids = [e["id"] for e in timeline]
    if len(ids) != len(set(ids)):
        dup = next(i for i in ids if ids.count(i) > 1)
        raise BuildError(f"{sid}: duplicate timeline id {dup}")

    for e in timeline:
        if e["category"] == "EMPLOYEE_ACTIVITY" and not e.get("actorId"):
            raise BuildError(f"{sid}: timeline event {e['id']} (EMPLOYEE_ACTIVITY) is missing actorId")

    txn_ids = {t["id"] for t in d["transactions"]}
    linked = {e["txnId"] for e in timeline if e.get("txnId")}
    for e in timeline:
        if e.get("txnId") and e["txnId"] not in txn_ids:
            raise BuildError(f"{sid}: timeline event {e['id']} references unknown transaction {e['txnId']}")
    if txn_ids - linked:
        raise BuildError(f"{sid}: transactions without a timeline event: {sorted(txn_ids - linked)}")

    node_ids = {n["id"] for n in d["nodes"]}
    for c in d["controls"]:
        if c["writerEventId"] and c["writerEventId"] not in ids:
            raise BuildError(f"{sid}: control {c['id']} references unknown event {c['writerEventId']}")
    for c in d["connections"]:
        if c["targetNodeId"] not in node_ids:
            raise BuildError(f"{sid}: connection references unknown node {c['targetNodeId']}")
        if c["credential"] not in d["employeeIds"]:
            raise BuildError(f"{sid}: connection credential {c['credential']} not in employeeIds")
    for a in d["victimAccountIds"]:
        if a not in node_ids:
            raise BuildError(f"{sid}: victim account {a} is not a node")

    for ins in y.get("insiders") or []:
        if ins["employeeId"] not in d["employeeIds"]:
            raise BuildError(f"{sid}: insider {ins['employeeId']} not in employeeIds")
        d["insiders"].append({**ins, "actions": [{**a, "at": iso(a["at"])} for a in ins["actions"]]})

    if y.get("replay"):
        d["replay"] = derive_replay(y["replay"], timeline)

    alert = y.get("alert")
    if alert and d["transactions"]:
        last = max(t["at"] for t in d["transactions"])
        if iso(alert["createdAt"]) < last:
            raise BuildError(f"{sid}: alert createdAt precedes the last transaction (invariant C17)")

    _scan_phone_numbers(d, sid)
    Scenario.model_validate(d)  # contract check (raises pydantic.ValidationError)
    return d


def check_twins(yamls: list[dict]) -> None:
    twinned = {y.get("twinOf") for y in yamls if y.get("twinOf")}
    for y in yamls:
        if y["kind"] == "ATTACK" and y["id"] not in twinned:
            raise BuildError(f"attack scenario {y['id']} has no legitimate twin")


def derive_facts(d: dict, accounts_by_type: dict | None = None) -> dict:
    """Same derivation the frontend uses (deriveAlertFacts). Amount at risk = executed outbound value from victim accounts."""
    victims = set(d["victimAccountIds"])
    at_risk = sum(
        t["amount"] for t in d["transactions"]
        if t["outcome"] == "EXECUTED" and t["from"] in victims and t["kind"] in ("TRANSFER", "PAYROLL", "SWEEP")
    )
    times = sorted(t["at"] for t in d["transactions"])
    return {
        "amountAtRisk": at_risk,
        "accountsCount": sum(1 for n in d["nodes"] if n["kind"] == "account"),
        "employeesCount": len(d["employeeIds"]),
        "customersCount": len(d["customerIds"]),
        "beneficiariesCount": len(d["beneficiaryIds"]),
        "transactionsCount": len(d["transactions"]),
        "firstTxnAt": times[0],
        "lastTxnAt": times[-1],
    }


def build_all() -> tuple[list[dict], dict[str, str]]:
    """Return (yamls, {scenarioId: json text}) after validating everything."""
    yamls = load_yaml_files()
    check_twins(yamls)
    out: dict[str, str] = {}
    built: dict[str, dict] = {}
    for y in yamls:
        built[y["id"]] = build_scenario(y)
    for sid, d in built.items():
        out[sid] = json.dumps(d, ensure_ascii=False, indent=1) + "\n"
    return yamls, out


def build_metrics() -> dict:
    src = ROOT / "data" / "metrics.yaml"
    m = yaml.safe_load(src.read_text(encoding="utf-8"))
    MetricsFile.model_validate(m)
    return m
