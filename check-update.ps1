# check-update.ps1
# Checks GitHub for new commits and runs update.ps1 if behind.
# This script is called automatically by Windows Task Scheduler every 10 minutes.

$projectPath = "D:\isp-erp-system"
$logFile     = "$projectPath\backups\auto-update.log"

function Write-Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
}

Set-Location $projectPath

# Fetch latest refs from GitHub (silent)
git fetch origin 2>$null

$localHash  = git rev-parse HEAD 2>$null
$remoteHash = git rev-parse origin/main 2>$null

if ($localHash -eq $remoteHash) {
    Write-Log "Up to date ($($localHash.Substring(0,7))). No update needed."
    exit 0
}

Write-Log "New update detected: local=$($localHash.Substring(0,7)) remote=$($remoteHash.Substring(0,7))"
Write-Log "Running update.ps1..."

powershell -ExecutionPolicy Bypass -File "$projectPath\update.ps1" *>> $logFile

Write-Log "update.ps1 finished."
