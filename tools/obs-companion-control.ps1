param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('start', 'stop', 'status')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$runtimeDirectory = Join-Path $root '.runtime'
$pidFile = Join-Path $runtimeDirectory 'chzzk-companion.pid'
$companionScript = Join-Path $root 'tools\chzzk-companion.js'

function Get-ManagedProcess {
    if (-not (Test-Path -LiteralPath $pidFile)) { return $null }
    try {
        $identity = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
        $storedPid = [int]$identity.pid
        $storedStartTicks = [long]$identity.startedAtTicks
    } catch {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    $managed = Get-Process -Id $storedPid -ErrorAction SilentlyContinue
    $actualStartTicks = if ($managed) { $managed.StartTime.ToUniversalTime().Ticks } else { 0 }
    if (-not $managed -or $managed.ProcessName -ne 'node' -or $actualStartTicks -ne $storedStartTicks) {
        Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
        return $null
    }
    return $managed
}

function Get-ObsProcess {
    return Get-Process -Name 'obs64' -ErrorAction SilentlyContinue |
        Sort-Object StartTime -Descending |
        Select-Object -First 1
}

if ($Action -eq 'status') {
    if (Get-ManagedProcess) { exit 0 }
    exit 1
}

if ($Action -eq 'stop') {
    $managed = Get-ManagedProcess
    if ($managed) {
        Stop-Process -Id $managed.Id -ErrorAction SilentlyContinue
        $managed.WaitForExit(3000) | Out-Null
    }
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    exit 0
}

if (Get-ManagedProcess) { exit 0 }
New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
$node = Get-Command 'node.exe' -ErrorAction Stop
$arguments = @($companionScript)
$obs = Get-ObsProcess
if ($obs) {
    $arguments += '--obs-parent'
    $arguments += [string]$obs.Id
}
$managed = Start-Process -FilePath $node.Source -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden -PassThru
$identity = @{
    pid = $managed.Id
    startedAtTicks = $managed.StartTime.ToUniversalTime().Ticks
} | ConvertTo-Json -Compress
[IO.File]::WriteAllText($pidFile, $identity, [Text.UTF8Encoding]::new($false))
