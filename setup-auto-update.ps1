# setup-auto-update.ps1
# Run this script ONCE on PC2 to register the automatic update task.
# It creates a Windows Scheduled Task that checks for updates every 10 minutes.
#
# Usage:  powershell -ExecutionPolicy Bypass -File .\setup-auto-update.ps1

$taskName    = "ISP-ERP Auto Update"
$projectPath = "D:\isp-erp-system"
$scriptPath  = "$projectPath\check-update.ps1"
$logDir      = "$projectPath\backups"

# Create backups folder for logs if not exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Remove existing task if any
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Action: run check-update.ps1
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -NonInteractive -File `"$scriptPath`"" `
    -WorkingDirectory $projectPath

# Trigger: every 10 minutes, starting now
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 10) -Once -At (Get-Date)

# Run as SYSTEM so it works even when no user is logged in
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Settings
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 2) `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Checks GitHub every 10 minutes and auto-updates ISP ERP system if new commits are found." `
    -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Auto-update task registered!"         -ForegroundColor Green
Write-Host "   Task name : $taskName"                -ForegroundColor Cyan
Write-Host "   Interval  : Every 10 minutes"         -ForegroundColor Cyan
Write-Host "   Log file  : $logDir\auto-update.log"  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To check status: Get-ScheduledTask -TaskName '$taskName'"
Write-Host "To remove task : Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
Write-Host "To view logs   : Get-Content '$logDir\auto-update.log' -Tail 30"
