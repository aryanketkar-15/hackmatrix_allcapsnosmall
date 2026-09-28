import copy
import hashlib
import json

import pytest
import yaml

from khoji_build import BuildError, SCENARIO_DIR, build_all, build_scenario, derive_facts, iso


@pytest.fixture(scope="module")
def built():
    yamls, out = build_all()
    return {y["id"]: y for y in yamls}, {k: json.loads(v) for k, v in out.items()}, out


def load_y(name):
    return yaml.safe_load((SCENARIO_DIR / name).read_text(encoding="utf-8"))


def test_build_writes_valid_scenarios(built):
    _, scenarios, _ = built
    assert "S1" in scenarios and "S1T" in scenarios


def test_determinism_same_hash():
    _, a = build_all()
    _, b = build_all()
    ha = {k: hashlib.sha256(v.encode()).hexdigest() for k, v in a.items()}
    hb = {k: hashlib.sha256(v.encode()).hexdigest() for k, v in b.items()}
    assert ha == hb


def test_s1_amount_invariant(built):
    _, sc, _ = built
    facts = derive_facts(sc["S1"])
    assert facts["amountAtRisk"] == 2980000  # Rs 29,80,000 = sum of outbound from A-001


def test_s1_count_invariants(built):
    _, sc, _ = built
    f = derive_facts(sc["S1"])
    assert (f["accountsCount"], f["employeesCount"], f["customersCount"], f["beneficiariesCount"], f["transactionsCount"]) == (3, 2, 1, 2, 7)


def test_s1_time_invariants(built):
    ys, sc, _ = built
    f = derive_facts(sc["S1"])
    assert f["firstTxnAt"].startswith("2024-04-30T09:12") and f["lastTxnAt"].startswith("2024-04-30T10:45")
    assert iso(ys["S1"]["alert"]["createdAt"]) >= f["lastTxnAt"]
    times = [e["at"] for e in sc["S1"]["timeline"]]
    assert times == sorted(times)


def test_replay_roles_and_consistency(built):
    _, sc, _ = built
    rp = sc["S1"]["replay"]
    roles = {c["id"]: c["role"] for c in rp["candidates"]}
    assert roles["c-mobile"] == "NECESSARY" and roles["c-benef"] == "NECESSARY" and roles["c-cooldown"] == "NECESSARY"
    assert roles["c-sms"] == "CONCEALING" and roles["c-open"] == "CONTRIBUTORY"
    single = {tuple(v["removed"]): v["outcome"] for v in rp["variants"]}
    assert single[("c-mobile",)] == "FAIL" and single[("c-sms",)] == "PASS" and single[()] == "PASS"
    assert len(rp["variants"]) == 2 ** len(rp["candidates"])


def test_cooldown_override_linked(built):
    _, sc, _ = built
    row = next(c for c in sc["S1"]["controls"] if c["id"] == "ctl-cooldown")
    assert row["writerEventId"] == "ev-cooldown"
    assert any(e["id"] == "ev-cooldown" and e["category"] == "CONTROL_CHECK" for e in sc["S1"]["timeline"])


def test_referential_integrity(built):
    _, sc, _ = built
    s = sc["S1"]
    ids = {e["id"] for e in s["timeline"]}
    nodes = {n["id"] for n in s["nodes"]}
    for c in s["controls"]:
        assert c["writerEventId"] in ids | {None}
    for c in s["connections"]:
        assert c["targetNodeId"] in nodes


def test_twin_is_genuine_and_explained(built):
    _, sc, _ = built
    t = sc["S1T"]
    assert t["level"] == "INFO" and t["twinOf"] == "S1" and t["explanation"]
    assert all(c["integrity"] == "GENUINE" for c in t["controls"])


def test_missing_actor_rejected():
    y = load_y("s1_takeover.yaml")
    for e in y["timeline"]:
        if e["id"] == "ev-login":
            del e["actorId"]
    with pytest.raises(BuildError, match="ev-login"):
        build_scenario(y)


def test_unmasked_phone_rejected():
    y = load_y("s1_takeover.yaml")
    y = copy.deepcopy(y)
    y["timeline"][3]["detail"] = "Old: 9876543210 -> New: 9876500999"
    with pytest.raises(BuildError, match="unmasked"):
        build_scenario(y)


def test_alert_before_last_transaction_rejected():
    y = load_y("s1_takeover.yaml")
    y["alert"]["createdAt"] = "2024-04-30 09:12"
    with pytest.raises(BuildError, match="createdAt"):
        build_scenario(y)
