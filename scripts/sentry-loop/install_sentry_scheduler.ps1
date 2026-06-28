<#
.SYNOPSIS
Registers two Windows Task Scheduler tasks for the Sentry auto-fix loop.

  Sentry_Loop_Detect    Daily 08:00  scripts/sentry-loop/sentry_detect.py
  Sentry_Loop_Worker    Daily 08:15  scripts/sentry-loop/sentry_repair_triage.py

Both tasks:
  - Run ONLY when the user is logged on (Remote Control needs an interactive console).
  - Run on battery (AllowStartIfOnBatteries).
  - Catch up on missed fires (StartWhenAvailable).
  - Run hidden (no console window pops up).
  - Time out after 60 minutes.

Idempotent: re-running removes any existing tasks with the same names and
re-creates them. Safe to run repeatedly.

The loop reads credentials from scripts/sentry-loop/.env (gitignored).
Make sure that file is present in the worktree before the first scheduled run.

.PARAMETER PythonPath
Full path to python.exe. Defaults to the result of `where python`.

.PARAMETER WorktreePath
Path to the dedicated miozuki-web worktree the scheduler runs against.
Defaults to the repo root two levels above this script.

.EXAMPLE
.\install_sentry_scheduler.ps1
.\install_sentry_scheduler.ps1 -WorktreePath "C:\Users\reonz\cursor\miozuki-web-sentry-loop"
#>

param(
    [string]$PythonPath = "",
    [string]$WorktreePath = ""
)

# Resolve WorktreePath (default: two levels above scripts/sentry-loop/ = repo root)
if (-not $WorktreePath) {
    $WorktreePath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
}
$WorktreePath = (Resolve-Path $WorktreePath).Path

# Resolve Python
if (-not $PythonPath) {
    $found = Get-Command python -ErrorAction SilentlyContinue
    if (-not $found) {
        Write-Error "python not on PATH. Pass -PythonPath explicitly."
        exit 1
    }
    $PythonPath = $found.Source
}
if (-not (Test-Path $PythonPath)) {
    Write-Error "PythonPath does not exist: $PythonPath"
    exit 1
}

# Sanity check: confirm the scripts exist in the worktree
$detectScript  = Join-Path $WorktreePath "scripts\sentry-loop\sentry_detect.py"
$workerScript  = Join-Path $WorktreePath "scripts\sentry-loop\sentry_repair_triage.py"
$envFile       = Join-Path $WorktreePath "scripts\sentry-loop\.env"

foreach ($f in @($detectScript, $workerScript)) {
    if (-not (Test-Path $f)) {
        Write-Error "Missing file in worktree: $f"
        Write-Error "Make sure the worktree is on master and has been pulled."
        exit 1
    }
}
if (-not (Test-Path $envFile)) {
    Write-Warning ".env not found at: $envFile"
    Write-Warning "Copy scripts/sentry-loop/.env into the worktree before the first run."
}

Write-Host "Worktree:    $WorktreePath"
Write-Host "Python:      $PythonPath"
Write-Host ""

function Register-SentryTask {
    param(
        [string]$TaskName,
        [string]$ScriptAbs,
        [string]$TriggerTime,
        [string]$Description
    )

    # Run in the worktree directory so relative paths in the scripts resolve correctly.
    $cmdLine = "/c cd /d `"$WorktreePath`" && `"$PythonPath`" `"$ScriptAbs`""
    $action  = New-ScheduledTaskAction -Execute "cmd.exe" -Argument $cmdLine -WorkingDirectory $WorktreePath

    $trigger = New-ScheduledTaskTrigger -Daily -At $TriggerTime

    # Interactive logon only: Remote Control requires an active console session.
    $principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Limited

    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -Hidden `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 60)

    # Remove existing if any
    schtasks /delete /tn $TaskName /f 2>$null | Out-Null

    Register-ScheduledTask `
        -TaskName    $TaskName `
        -Action      $action `
        -Trigger     $trigger `
        -Principal   $principal `
        -Settings    $settings `
        -Description $Description `
        -Force | Out-Null

    Write-Host "Registered: $TaskName  (daily $TriggerTime)"
}

# 1. Detector (08:00 NZT) — fetches Sentry, classifies, queues one fixable issue
Register-SentryTask `
    -TaskName    "Sentry_Loop_Detect" `
    -ScriptAbs   $detectScript `
    -TriggerTime "08:00am" `
    -Description "Sentry auto-fix loop: fetch unresolved miozuki-web errors, classify, queue one fixable issue."

# 2. Worker (08:15 NZT) — branches, fixes, phones Ryo for approval
Register-SentryTask `
    -TaskName    "Sentry_Loop_Worker" `
    -ScriptAbs   $workerScript `
    -TriggerTime "08:15am" `
    -Description "Sentry auto-fix loop: pick up a queued issue, fix it on a branch, re-verify, ping Ryo's phone for approve/reject."

Write-Host ""
Write-Host "Done. Verify in Task Scheduler (taskschd.msc)."
Write-Host "Both tasks run daily at 08:00 / 08:15 NZT, interactive session only."
