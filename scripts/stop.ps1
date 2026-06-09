Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeRoot = Join-Path $scriptRoot ".runtime"
$pidRoot = Join-Path $runtimeRoot "pids"

# Services in reverse startup order — stop the edge first, then the backends
$services = @(
    @{ Name = "frontend";     DisplayName = "Frontend";     Port = 5173 },
    @{ Name = "api-gateway";  DisplayName = "API Gateway";  Port = 4000 },
    @{ Name = "auth-service"; DisplayName = "Auth Service"; Port = 5001 },
    @{ Name = "core-service"; DisplayName = "Core Service"; Port = 8080 },
    @{ Name = "ai-service";   DisplayName = "AI Service";   Port = 8000 }
)

function Get-PidFilePath {
    param([hashtable]$Service)
    Join-Path $pidRoot "$($Service.Name).pid"
}

function Get-ServiceProcess {
    param([hashtable]$Service)

    $pidFile = Get-PidFilePath -Service $Service
    if (-not (Test-Path -LiteralPath $pidFile)) {
        return $null
    }

    $pidValue = (Get-Content -LiteralPath $pidFile -ErrorAction Stop | Select-Object -First 1).Trim()
    if (-not $pidValue) {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    try {
        Get-Process -Id ([int]$pidValue) -ErrorAction Stop
    }
    catch {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        $null
    }
}

function Get-PortProcess {
    param([int]$Port)

    $listeners = netstat -ano | Select-String ":$Port\s+.*LISTENING"
    if (-not $listeners) {
        return $null
    }

    $line = ($listeners | Select-Object -First 1).Line.Trim()
    $parts = $line -split "\s+"
    $pidValue = $parts[-1]

    try {
        Get-Process -Id ([int]$pidValue) -ErrorAction Stop
    }
    catch {
        $null
    }
}

function Stop-ServiceProcess {
    param([hashtable]$Service)

    $pidFile = Get-PidFilePath -Service $Service
    $processes = @()

    $pidProcess = Get-ServiceProcess -Service $Service
    if ($null -ne $pidProcess) {
        $processes += $pidProcess
    }

    if ($Service.ContainsKey("Port")) {
        $portProcess = Get-PortProcess -Port $Service.Port
        if ($null -ne $portProcess -and -not ($processes | Where-Object { $_.Id -eq $portProcess.Id })) {
            $processes += $portProcess
        }
    }

    if ($processes.Count -eq 0) {
        Write-Host "$($Service.DisplayName) is not running."
        return
    }

    try {
        foreach ($process in $processes) {
            cmd.exe /c "taskkill /PID $($process.Id) /T /F >nul 2>&1"
            Write-Host "Stopped $($Service.DisplayName) with PID $($process.Id)."
        }
    }
    finally {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    }
}

foreach ($service in $services) {
    Stop-ServiceProcess -Service $service
}
