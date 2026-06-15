<#
.SYNOPSIS
    Starts the InternNova AI pipeline service (FastAPI + Uvicorn).

.DESCRIPTION
    Run from the ai-service/ directory:
        powershell -ExecutionPolicy Bypass -File scripts/start.ps1

    Or with a custom port:
        $env:PORT=9000; powershell -ExecutionPolicy Bypass -File scripts/start.ps1

    The service exposes:
      - POST /pipeline/v1/evaluate         (called by core-service on application submit)
      - POST /pipeline/v1/generate-resume  (resume PDF generator)
      - GET  /health                        (health check)

    Requires: run scripts/setup.ps1 first.
#>

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$venvDir = Join-Path $PSScriptRoot "..\.venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Error "Virtual environment not found at $venvDir"
    Write-Error "Run setup first:  powershell -ExecutionPolicy Bypass -File scripts/setup.ps1"
    exit 1
}

# Load .env into environment if it exists (uvicorn + pydantic-settings will
# also read it, but this makes vars available for any subprocess).
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line -split "=", 2
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if ($key -and (-not (Test-Path "env:$key"))) {
                Set-Item -Path "env:$key" -Value $val
            }
        }
    }
}

$port = if ($env:PORT) { $env:PORT } else { "8000" }
$hostAddr = "0.0.0.0"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  InternNova AI Service" -ForegroundColor Cyan
Write-Host "  http://${hostAddr}:${port}" -ForegroundColor White
Write-Host "  Health: http://localhost:${port}/health" -ForegroundColor White
Write-Host "  API:    http://localhost:${port}/docs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& $pythonExe -m uvicorn app.main:app --host $hostAddr --port $port --log-level info
