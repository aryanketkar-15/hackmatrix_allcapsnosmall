from fastapi import FastAPI

app = FastAPI(title="KHOJI fixture API", version="0.5.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
