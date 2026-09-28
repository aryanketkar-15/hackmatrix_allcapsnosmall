#!/usr/bin/env python
"""Build deterministic scenario fixtures: data/scenarios/*.yaml -> frontend/public/fixtures/scenarios/*.json."""
import sys

from khoji_build import BuildError, OUT_DIR, SCENARIO_OUT, build_all, build_metrics, dump_json

try:
    from pydantic import ValidationError
except ImportError:  # pragma: no cover
    ValidationError = ()  # type: ignore


def main() -> int:
    try:
        _, out = build_all()
        SCENARIO_OUT.mkdir(parents=True, exist_ok=True)
        for old in SCENARIO_OUT.glob("*.json"):
            old.unlink()
        for sid, text in out.items():
            (SCENARIO_OUT / f"{sid.lower()}.json").write_text(text, encoding="utf-8", newline="\n")
        if (OUT_DIR.parent.parent.parent / "data" / "metrics.yaml").exists():
            dump_json(build_metrics(), OUT_DIR / "metrics.json")
    except BuildError as e:
        print(f"BUILD ERROR: {e}", file=sys.stderr)
        return 1
    except ValidationError as e:
        print(f"CONTRACT ERROR: {e}", file=sys.stderr)
        return 1
    print(f"built {len(out)} scenario fixtures")
    return 0


if __name__ == "__main__":
    sys.exit(main())
