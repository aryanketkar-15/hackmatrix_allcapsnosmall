$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location "$root\backend"; python -m pytest -q; Pop-Location
Push-Location "$root\frontend"; npx tsc -b --noEmit; npx vitest run; npx vite build | Out-Null; Pop-Location
Write-Host 'ALL CHECKS PASSED'
