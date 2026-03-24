# ===========================================
# ISP ERP System - Update Script (PC2)
# ===========================================

$PC2_IP       = "192.200.251.4"
$projectPath  = "D:\isp-erp-system"
$frontendPath = "$projectPath\frontend"

# Write a simple log file (no transcript - avoid file locking issues)
$logsDir = "$projectPath\logs"
New-Item -ItemType Directory -Path $logsDir -Force -ErrorAction SilentlyContinue | Out-Null
$logFile = "$logsDir\deploy-update.log"
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$ts] update.ps1 started" | Out-File $logFile -Encoding utf8 -Force

if (-not (Test-Path $projectPath)) {
    "[ERROR] Folder not found: $projectPath" | Out-File $logFile -Append -Encoding utf8; exit 1
}

Set-Location $projectPath

# Step 0: Database backup
$dbFile = "$projectPath\isp-erp.sqlite"
if (Test-Path $dbFile) {
    $backupDir = "$projectPath\backups"
    New-Item -ItemType Directory -Path $backupDir -Force -ErrorAction SilentlyContinue | Out-Null
    $timestamp  = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $backupFile = "$backupDir\isp-erp_$timestamp.sqlite"
    Copy-Item $dbFile $backupFile
    "[0] DB backup: $backupFile" | Out-File $logFile -Append -Encoding utf8
    Get-ChildItem "$backupDir\*.sqlite" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item -Force
}

# Step 1: Pull latest code from GitHub
"[1/3] git pull..." | Out-File $logFile -Append -Encoding utf8
Set-Location $projectPath
$gitOut = git fetch origin 2>&1 ; $gitOut | Out-File $logFile -Append -Encoding utf8
$gitOut2 = git reset --hard origin/main 2>&1 ; $gitOut2 | Out-File $logFile -Append -Encoding utf8
$gitOut3 = git clean -fd 2>&1 ; $gitOut3 | Out-File $logFile -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) {
    "[ERROR] git failed" | Out-File $logFile -Append -Encoding utf8; exit 1
}
"[1/3] Done." | Out-File $logFile -Append -Encoding utf8

# Step 2: Install packages (only if package.json changed)
"[2/3] npm install..." | Out-File $logFile -Append -Encoding utf8
Set-Location $projectPath
npm install --omit=dev --prefer-offline 2>&1 | Out-File $logFile -Append -Encoding utf8
Set-Location $frontendPath
npm install --omit=dev --legacy-peer-deps --prefer-offline 2>&1 | Out-File $logFile -Append -Encoding utf8
Set-Location $projectPath
"[2/3] Done." | Out-File $logFile -Append -Encoding utf8

# Step 2b: SSL certs
$sslKey = "$frontendPath\ssl\server.key"
if (-not (Test-Path $sslKey)) {
    "[SSL] Generating certificate..." | Out-File $logFile -Append -Encoding utf8
    Set-Location $frontendPath
    node generate-ssl.cjs 2>&1 | Out-File $logFile -Append -Encoding utf8
    Set-Location $projectPath
    "[SSL] Done." | Out-File $logFile -Append -Encoding utf8
} else {
    "[SSL] Certificate exists, skipping." | Out-File $logFile -Append -Encoding utf8
}

# Step 3: Restart services (stop+start is more reliable than reload on Windows)
"[3/3] Restarting PM2 services..." | Out-File $logFile -Append -Encoding utf8
Set-Location $projectPath
pm2 delete isp-frontend-8080 2>&1 | Out-Null
pm2 stop isp-backend 2>&1 | Out-File $logFile -Append -Encoding utf8
pm2 stop isp-frontend 2>&1 | Out-File $logFile -Append -Encoding utf8
Start-Sleep -Seconds 2
pm2 start isp-backend 2>&1 | Out-File $logFile -Append -Encoding utf8
pm2 start isp-frontend 2>&1 | Out-File $logFile -Append -Encoding utf8
pm2 start ecosystem.config.js --only isp-frontend-8080 2>&1 | Out-File $logFile -Append -Encoding utf8
pm2 save 2>&1 | Out-File $logFile -Append -Encoding utf8
"[3/3] Done." | Out-File $logFile -Append -Encoding utf8

$ts2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$ts2] Update completed. http://${PC2_IP}:8080" | Out-File $logFile -Append -Encoding utf8



