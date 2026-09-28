import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models import SCHEMAS

SAMPLES = Path(__file__).resolve().parents[2] / "data" / "contract-samples"
MANIFEST = json.loads((SAMPLES / "manifest.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("entry", MANIFEST, ids=[e["file"] for e in MANIFEST])
def test_sample_parity(entry):
    data = json.loads((SAMPLES / entry["file"]).read_text(encoding="utf-8"))
    model = SCHEMAS[entry["schema"]]
    if entry["valid"]:
        model.model_validate(data)
    else:
        with pytest.raises(ValidationError):
            model.model_validate(data)


def test_risk_score_is_rejected():
    data = json.loads((SAMPLES / "valid_alert.json").read_text(encoding="utf-8"))
    data["riskScore"] = 92
    with pytest.raises(ValidationError):
        SCHEMAS["Alert"].model_validate(data)
