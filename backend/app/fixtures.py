"""Fixture loading with fail-fast validation. The frontend's generated fixtures are the single source of truth."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from .models import CoreFile, MetricsFile, Scenario

DEFAULT_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "fixtures"


class FixtureError(RuntimeError):
    """A fixture is missing or invalid. The message always names the file."""


@dataclass(frozen=True)
class Fixtures:
    core: dict[str, Any]
    metrics: dict[str, Any]
    scenarios: dict[str, dict[str, Any]]  # keyed by scenario id (e.g. "S1"); the only way ids resolve to data


def _read(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise FixtureError(f"{path.name}: fixture file not found at {path}") from None
    except json.JSONDecodeError as e:
        raise FixtureError(f"{path.name}: not valid JSON ({e})") from None


def _validate(model, data: dict[str, Any], name: str) -> None:
    try:
        model.model_validate(data)
    except ValidationError as e:
        first = e.errors()[0]
        loc = ".".join(str(p) for p in first["loc"])
        raise FixtureError(f"{name}: invalid data at '{loc}': {first['msg']}") from None


def resolve_dir(directory: str | os.PathLike | None = None) -> Path:
    return Path(directory or os.environ.get("KHOJI_FIXTURES_DIR") or DEFAULT_DIR)


def load_fixtures(directory: str | os.PathLike | None = None) -> Fixtures:
    root = resolve_dir(directory)
    core = _read(root / "core.json")
    _validate(CoreFile, core, "core.json")
    metrics = _read(root / "metrics.json")
    _validate(MetricsFile, metrics, "metrics.json")

    scenarios: dict[str, dict[str, Any]] = {}
    for entry in core["scenarios"]:
        # the index (not user input) decides which file is read
        data = _read(root / entry["file"])
        _validate(Scenario, data, entry["file"])
        scenarios[entry["id"].upper()] = data
    return Fixtures(core=core, metrics=metrics, scenarios=scenarios)
