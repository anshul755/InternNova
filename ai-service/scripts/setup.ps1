<#
.SYNOPSIS
    One-time setup for the AI service: creates the virtual environment, installs
    Python dependencies, downloads the Tectonic LaTeX engine, and creates a .env
    file from the template if one doesn't already exist.

.DESCRIPTION
    Run this from the ai-service/ directory:
        powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

    After setup, start the service with:
        powershell -ExecutionPolicy Bypass -File scripts/start.ps1
#>

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  InternNova AI Service — Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Virtual environment ──────────────────────────────────────────────────────
$venvDir = Join-Path $PSScriptRoot "..\.venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"

if (Test-Path $pythonExe) {
    Write-Host "[1/4] Virtual environment already exists at $venvDir" -ForegroundColor Green
} else {
    Write-Host "[1/4] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venvDir
    if (-not (Test-Path $pythonExe)) {
        Write-Error "Failed to create virtual environment. Make sure Python 3.10+ is installed and on PATH."
        exit 1
    }
    Write-Host "       Created: $venvDir" -ForegroundColor Green
}

# ── 2. Python dependencies ───────────────────────────────────────────────────────
Write-Host "[2/4] Installing Python dependencies..." -ForegroundColor Yellow
$requirements = Join-Path $PSScriptRoot "..\requirements.txt"
& $pythonExe -m pip install -r $requirements --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error "pip install failed. Check the error output above."
    exit 1
}
Write-Host "       Dependencies installed successfully." -ForegroundColor Green

# ── 3. Tectonic LaTeX engine ─────────────────────────────────────────────────────
Write-Host "[3/4] Setting up Tectonic LaTeX engine..." -ForegroundColor Yellow
$installTectonic = Join-Path $PSScriptRoot "install_tectonic.ps1"
& powershell -ExecutionPolicy Bypass -File $installTectonic
Write-Host "       Tectonic ready." -ForegroundColor Green

# ── 4. .env file ─────────────────────────────────────────────────────────────────
Write-Host "[4/4] Checking .env configuration..." -ForegroundColor Yellow
$envTemplate = Join-Path $PSScriptRoot "..\.env.example"
$envFile = Join-Path $PSScriptRoot "..\.env"

if (Test-Path $envFile) {
    Write-Host "       .env already exists — skipping." -ForegroundColor Green
} else {
    Copy-Item $envTemplate $envFile
    Write-Host "       Created .env from .env.example." -ForegroundColor Yellow
    Write-Host "       >>> Edit $envFile and add your GROQ_API_KEY before starting. <<<" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup complete!" -ForegroundColor Cyan
Write-Host "  1. Edit ai-service/.env and set GROQ_API_KEY" -ForegroundColor White
Write-Host "  2. Start the service:  powershell -File scripts/start.ps1" -ForegroundColor White
Write-Host "  3. Health check:       http://localhost:8000/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
