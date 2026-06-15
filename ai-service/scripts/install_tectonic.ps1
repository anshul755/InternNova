<#
Downloads the self-contained Tectonic LaTeX engine into AI/tools/tectonic.exe.

The resume generator compiles .tex -> PDF locally (offline mode, the default) using
this binary. It needs no admin rights or package manager. The first real compile
also downloads Tectonic's package/font bundle once (cached afterwards).

Usage (from AI/):  powershell -ExecutionPolicy Bypass -File scripts/install_tectonic.ps1
#>

$ErrorActionPreference = "Stop"
$version = "0.16.9"
$toolsDir = Join-Path $PSScriptRoot "..\tools"
$exe = Join-Path $toolsDir "tectonic.exe"

if (Test-Path $exe) {
    Write-Host "Tectonic already present at $exe"
    exit 0
}

New-Item -ItemType Directory -Force $toolsDir | Out-Null
$zip = Join-Path $toolsDir "tectonic.zip"
$url = "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40$version/tectonic-$version-x86_64-pc-windows-msvc.zip"

Write-Host "Downloading Tectonic $version ..."
Invoke-WebRequest -Uri $url -OutFile $zip
Expand-Archive -Path $zip -DestinationPath $toolsDir -Force
Remove-Item $zip
Write-Host "Installed -> $exe"
