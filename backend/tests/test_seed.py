import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timedelta

import pytest
import yaml

from khoji_build import OUT_DIR, ROOT, derive_facts

CFG = yaml.safe_load((ROOT / "data" / "seed.yaml").read_text(encoding="utf-8"))
BANNED = re.compile(r"\b(guilty|culprit|fraudster|criminal|thief|stole|accused|crook|scammer)\b", re.I)


@pytest.fixture(scope="module")
def core():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build_seed.py")], check=True, capture_output=True)
    return json.loads((OUT_DIR / "core.json").read_text(encoding="utf-8"))


def test_level_counts(core):
    assert Counter(a["level"] for a in core["alerts"]) == Counter(CFG["levels"])
    assert len(core["alerts"]) == 124


def test_status_counts(core):
    assert Counter(a["status"] for a in core["alerts"]) == Counter(CFG["statuses"])


def test_type_counts(core):
    assert Counter(a["type"] for a in core["alerts"]) == Counter(CFG["types"])


def test_determinism():
    def run():
        subprocess.run([sys.executable, str(ROOT / "scripts" / "build_seed.py")], check=True, capture_output=True)
        return hashlib.sha256((OUT_DIR / "core.json").read_bytes()).hexdigest()
    assert run() == run()


def test_window(core):
    for a in core["alerts"]:
        assert "2024-04-01" <= a["createdAt"][:10] <= "2024-04-30"


def test_closed_this_week(core):
    as_of = datetime.fromisoformat(core["meta"]["asOf"])
    recent = [a for a in core["alerts"] if a["closedAt"] and datetime.fromisoformat(a["closedAt"]) >= as_of - timedelta(days=7)]
    assert len(recent) == CFG["closedRecent"]
    assert sum(1 for a in core["alerts"] if a["status"] == "CLOSED") == 34


def test_kpis(core):
    a = core["alerts"]
    assert sum(1 for x in a if x["status"] in ("INVESTIGATING", "PENDING_EVIDENCE")) == 46
    assert sum(1 for x in a if x["level"] == "HIGH") == 28


def test_integrity(core):
    ids = [a["id"] for a in core["alerts"]]
    assert len(ids) == len(set(ids))
    emp = {e["id"] for e in core["employees"]}
    for a in core["alerts"]:
        assert set(a["entityRefs"]["employeeIds"]) <= emp
    assert len(core["cases"]) == 92
    assert {c["alertId"] for c in core["cases"]} <= set(ids)
    assert len(core["employees"]) == 30 and len(core["customers"]) == 40


def test_scenario_parity(core):
    for a in core["alerts"]:
        if a["detailLevel"] != "FULL":
            continue
        s = json.loads((OUT_DIR / "scenarios" / f"{a['scenarioId'].lower()}.json").read_text(encoding="utf-8"))
        assert a["listFacts"] == derive_facts(s)


def test_hero_facts(core):
    hero = next(a for a in core["alerts"] if a["id"] == "ALT-2024-001")
    assert hero["listFacts"]["amountAtRisk"] == 2980000
    assert hero["createdAt"] == max(a["createdAt"] for a in core["alerts"])


def test_language_scan(core):
    assert not BANNED.search(json.dumps(core, ensure_ascii=False))


def test_every_alert_has_evidence_and_reasons(core):
    assert all(a["evidenceSummary"] and a["reasons"] for a in core["alerts"])


def test_no_unmasked_phone(core):
    assert not re.search(r"(?<!\d)\d{10}(?!\d)", json.dumps(core))
    assert all(re.fullmatch(r"•{6}\d{3}", c["maskedPhone"]) for c in core["customers"])
