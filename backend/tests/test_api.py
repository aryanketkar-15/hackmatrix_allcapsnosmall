import json
import shutil

import pytest
from fastapi.testclient import TestClient

from app.fixtures import DEFAULT_DIR, FixtureError
from app.main import app, create_app

client = TestClient(app)


def test_core_returns_124_alerts():
    r = client.get("/api/core")
    assert r.status_code == 200
    assert len(r.json()["alerts"]) == 124


def test_scenario_by_id_validates_and_is_case_insensitive():
    r = client.get("/api/scenarios/S1")
    assert r.status_code == 200 and r.json()["id"] == "S1"
    assert client.get("/api/scenarios/s1").json()["id"] == "S1"


def test_unknown_scenario_is_404():
    assert client.get("/api/scenarios/ZZ").status_code == 404


@pytest.mark.parametrize("evil", ["..%2F..%2Fetc%2Fpasswd", "..\\..\\secret", "%2e%2e%2fcore", "s1.json"])
def test_path_traversal_is_rejected(evil):
    r = client.get(f"/api/scenarios/{evil}")
    assert r.status_code == 404
    assert "root:" not in r.text


def test_bad_fixture_fails_at_startup_and_names_the_file(tmp_path):
    shutil.copytree(DEFAULT_DIR, tmp_path / "fx")
    bad = tmp_path / "fx" / "scenarios" / "s1.json"
    data = json.loads(bad.read_text(encoding="utf-8"))
    data["level"] = "CRITICAL"
    bad.write_text(json.dumps(data), encoding="utf-8")
    with pytest.raises(FixtureError, match=r"scenarios/s1\.json: invalid data at 'level'"):
        create_app(tmp_path / "fx")


def test_missing_fixture_names_the_file(tmp_path):
    shutil.copytree(DEFAULT_DIR, tmp_path / "fx")
    (tmp_path / "fx" / "metrics.json").unlink()
    with pytest.raises(FixtureError, match=r"metrics\.json"):
        create_app(tmp_path / "fx")


def test_cors_allows_only_the_dev_origin():
    ok = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    bad = client.get("/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in bad.headers


def test_metrics_are_pending_without_values():
    m = client.get("/api/metrics").json()
    assert m["status"] == "PENDING_EVALUATION" and "values" not in m


def test_api_is_read_only():
    assert client.post("/api/core").status_code == 405
    assert client.delete("/api/scenarios/S1").status_code == 405


def test_docs_list_the_endpoints():
    paths = client.get("/openapi.json").json()["paths"]
    assert {"/health", "/api/core", "/api/metrics", "/api/scenarios/{scenario_id}"} <= set(paths)


def test_api_serves_exactly_the_fixture_bytes_contract():
    raw = json.loads((DEFAULT_DIR / "core.json").read_text(encoding="utf-8"))
    assert client.get("/api/core").json() == raw
