Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$stopScript = Join-Path $PSScriptRoot "stop.ps1"
$startScript = Join-Path $PSScriptRoot "start.ps1"

if (-not (Test-Path -LiteralPath $stopScript)) {
    throw "Missing script: $stopScript"
}

if (-not (Test-Path -LiteralPath $startScript)) {
    throw "Missing script: $startScript"
}

Write-Host "=== Stopping all services ==="
& $stopScript

Write-Host ""
Write-Host "=== Starting all services ==="
& $startScript
