Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$runtimeRoot = Join-Path $scriptRoot ".runtime"
$pidRoot = Join-Path $runtimeRoot "pids"
$logRoot = Join-Path $runtimeRoot "logs"

foreach ($path in @($runtimeRoot, $pidRoot, $logRoot)) {
    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

$services = @(
    @{
        Name = "frontend"
        DisplayName = "Frontend"
        WorkingDirectory = Join-Path $projectRoot "Frontend"
        Command = "npm.cmd"
        Arguments = @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort")
        Port = 5173
    },
    @{
        Name = "core-service"
        DisplayName = "Core Service"
        WorkingDirectory = Join-Path $projectRoot "core-service"
        Command = ".\mvnw.cmd"
        Arguments = @("spring-boot:run")
        Port = 8080
    },
    @{
        Name = "auth-service"
        DisplayName = "Auth Service"
        WorkingDirectory = Join-Path $projectRoot "auth-service"
        Command = "npm.cmd"
        Arguments = @("run", "dev")
        Port = 5001
    }
)

function Get-PidFilePath {
    param([hashtable]$Service)
    Join-Path $pidRoot "$($Service.Name).pid"
}

function Get-StdOutLogPath {
    param([hashtable]$Service)
    Join-Path $logRoot "$($Service.Name).out.log"
}

function Get-StdErrLogPath {
    param([hashtable]$Service)
    Join-Path $logRoot "$($Service.Name).err.log"
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

function Assert-ServicePrerequisites {
    param([hashtable]$Service)

    if (-not (Test-Path -LiteralPath $Service.WorkingDirectory)) {
        throw "Service folder not found: $($Service.WorkingDirectory)"
    }

    if ($Service.Command -like ".\*") {
        $commandPath = Join-Path $Service.WorkingDirectory ($Service.Command -replace '^\.\\', '')
        if (-not (Test-Path -LiteralPath $commandPath)) {
            throw "Service command not found: $commandPath"
        }
    }
}

function Resolve-ServiceCommand {
    param([hashtable]$Service)

    if ($Service.Command -like ".\*") {
        return (Join-Path $Service.WorkingDirectory ($Service.Command -replace '^\.\\', ''))
    }

    return $Service.Command
}

function Start-ServiceProcess {
    param([hashtable]$Service)

    Assert-ServicePrerequisites -Service $Service

    if ($Service.ContainsKey("Port")) {
        $portProcess = Get-PortProcess -Port $Service.Port
        if ($null -ne $portProcess) {
            Set-Content -LiteralPath (Get-PidFilePath -Service $Service) -Value $portProcess.Id
            Write-Host "$($Service.DisplayName) is already listening on port $($Service.Port) with PID $($portProcess.Id)."
            return
        }
    }

    $existingProcess = Get-ServiceProcess -Service $Service
    if ($null -ne $existingProcess) {
        Write-Host "$($Service.DisplayName) is already running with PID $($existingProcess.Id)."
        return
    }

    $resolvedCommand = Resolve-ServiceCommand -Service $Service

    try {
        $process = Start-Process `
            -FilePath $resolvedCommand `
            -ArgumentList $Service.Arguments `
            -WorkingDirectory $Service.WorkingDirectory `
            -RedirectStandardOutput (Get-StdOutLogPath -Service $Service) `
            -RedirectStandardError (Get-StdErrLogPath -Service $Service) `
            -PassThru `
            -WindowStyle Hidden
    }
    catch {
        throw "Failed to start $($Service.DisplayName) using '$resolvedCommand'. $($_.Exception.Message)"
    }

    $trackedProcess = $process
    if ($Service.ContainsKey("Port")) {
        for ($attempt = 1; $attempt -le 60; $attempt++) {
            Start-Sleep -Milliseconds 500
            $portProcess = Get-PortProcess -Port $Service.Port
            if ($null -ne $portProcess) {
                $trackedProcess = $portProcess
                break
            }
        }
    }

    # Write the PID of the actual tracked process. If a listener was detected
    # we prefer that PID (child process such as `node` or `java`), otherwise
    # fall back to the starter process PID.
    $pidToWrite = $trackedProcess.Id
    Set-Content -LiteralPath (Get-PidFilePath -Service $Service) -Value $pidToWrite
    if ($Service.ContainsKey("Port")) {
        if ($trackedProcess.Id -ne $process.Id) {
            Write-Host "Started $($Service.DisplayName) on port $($Service.Port) (starter PID $($process.Id), listener PID $($trackedProcess.Id))."
        }
        else {
            Write-Host "Started $($Service.DisplayName) on port $($Service.Port) with PID $($process.Id)."
        }
    }
    else {
        Write-Host "Started $($Service.DisplayName) with PID $($process.Id)."
    }
}

function Stop-ServiceProcess {
    param([hashtable]$Service)

    $pidFile = Get-PidFilePath -Service $Service
    $process = Get-ServiceProcess -Service $Service
    if ($null -eq $process) {
        return
    }

    try {
        cmd.exe /c "taskkill /PID $($process.Id) /T /F >nul 2>&1"
        Write-Host "Rolled back $($Service.DisplayName) with PID $($process.Id)."
    }
    finally {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    }
}

$startedServices = @()

try {
    foreach ($service in $services) {
        Start-ServiceProcess -Service $service
        $startedServices += $service
    }
}
catch {
    for ($i = $startedServices.Count - 1; $i -ge 0; $i--) {
        Stop-ServiceProcess -Service $startedServices[$i]
    }
    Write-Error $_
    throw
}
