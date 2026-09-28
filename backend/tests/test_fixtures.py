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


# ---- M1.3: remaining scenarios + metrics ----
def test_all_scenarios_present(built):
    _, sc, _ = built
    assert set(sc) == {"S1", "S1T", "S2", "S2T", "S3", "S3T", "S4", "S5", "S6"}


def test_every_attack_has_a_twin(built):
    ys, _, _ = built
    twinned = {y["twinOf"] for y in ys.values() if y.get("twinOf")}
    assert {"S1", "S2", "S3"} <= twinned


def test_explained_scenarios_carry_explanation(built):
    _, sc, _ = built
    for sid in ("S2T", "S3T", "S4"):
        assert sc[sid]["level"] == "INFO" and sc[sid]["explanation"]
        assert any(c["name"] == "Explanation check" and c["outcome"] == "PASS" for c in sc[sid]["controls"])


def test_s2_jointly_necessary_pair(built):
    _, sc, _ = built
    rp = sc["S2"]["replay"]
    roles = {c["id"]: c["role"] for c in rp["candidates"]}
    assert roles["c-raise-a"] == roles["c-raise-b"] == "JOINTLY_NECESSARY"
    out = {tuple(v["removed"]): v["outcome"] for v in rp["variants"]}
    assert out[("c-raise-a",)] == "PASS" and out[("c-raise-b",)] == "PASS"
    assert out[("c-raise-a", "c-raise-b")] == "FAIL"


def test_s3_profile_edit_link(built):
    _, sc, _ = built
    assert any(c["type"] == "PROFILE_EDIT" for c in sc["S3"]["connections"])
    assert sc["S3"]["replay"]["candidates"][0]["role"] == "NECESSARY"


def test_s5_data_gap_named(built):
    _, sc, _ = built
    s = sc["S5"]
    assert s["level"] == "DATA_GAP"
    assert any(e.get("gap") for e in s["timeline"])
    missing = [i for i in s["evidenceSummary"] if i["status"] in ("MISSING", "NOT_FOUND", "NOT_AVAILABLE")]
    assert len(missing) >= 3
    assert any(c["integrity"] == "UNKNOWN" and c["writerGrade"] == "U" for c in s["controls"])


def test_s6_control_held(built):
    _, sc, _ = built
    s = sc["S6"]
    assert s["transactions"][0]["outcome"] == "BLOCKED"
    assert any(c["outcome"] == "FAIL" and c["integrity"] == "GENUINE" for c in s["controls"])


def test_metrics_pending_has_no_values():
    from khoji_build import build_metrics
    m = build_metrics()
    assert m["status"] == "PENDING_EVALUATION" and "values" not in m
    assert {b["id"] for b in m["baselines"]} == {"B0", "B1", "B2", "B3", "B4"}


def test_attack_without_twin_rejected():
    from khoji_build import check_twins, load_yaml_files
    ys = [y for y in load_yaml_files() if y["id"] != "S3T"]
    with pytest.raises(BuildError, match="S3"):
        check_twins(ys)
