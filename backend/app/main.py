from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .fixtures import Fixtures, load_fixtures

ALLOWED_ORIGINS = ["http://localhost:5173"]


def create_app(fixtures_dir: str | os.PathLike | None = None) -> FastAPI:
    """Read-only fixture API. Fixtures are fully validated when the app is created (fail fast, error names the file)."""
    fx: Fixtures = load_fixtures(fixtures_dir)
    app = FastAPI(title="KHOJI fixture API", version="0.5.0",
                  description="Read-only, validated scenario fixtures. The second half replaces these with real engines.")
    app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["GET"], allow_headers=["*"])

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/core")
    def core() -> dict:
        return fx.core

    @app.get("/api/metrics")
    def metrics() -> dict:
        return fx.metrics

    @app.get("/api/scenarios/{scenario_id}")
    def scenario(scenario_id: str) -> dict:
        # ids resolve only through the loaded index; no path is ever built from the request
        data = fx.scenarios.get(scenario_id.upper())
        if data is None:
            raise HTTPException(status_code=404, detail="Unknown scenario")
        return data

    return app


app = create_app()
