# ===========================================
# ISP ERP System - Update Script (PC2)
# Run this file on PC2 after every update
# ===========================================

$PC2_IP       = "192.200.251.4"
$projectPath  = "D:\isp-erp-system"
$frontendPath = "$projectPath\frontend"

# ─── Logging: capture ALL output to a transcript file ─────────
$logsDir  = "$projectPath\logs"
$logFile  = "$logsDir\deploy-update.log"
New-Item -ItemType Directory -Path $logsDir -Force -ErrorAction SilentlyContinue | Out-Null
Start-Transcript -Path $logFile -Force | Out-Null
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] update.ps1 started"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ISP ERP System - Update PC2"          -ForegroundColor Cyan
Write-Host "   $PC2_IP"                              -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $projectPath)) {
    Write-Host "ERROR: Folder not found: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# Step 0: Database backup
$dbFile = "$projectPath\isp-erp.sqlite"
if (Test-Path $dbFile) {
    $backupDir = "$projectPath\backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    $timestamp  = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $backupFile = "$backupDir\isp-erp_$timestamp.sqlite"
    Copy-Item $dbFile $backupFile
    Write-Host "[0/5] Database backup: backups\isp-erp_$timestamp.sqlite" -ForegroundColor Cyan
    Get-ChildItem "$backupDir\*.sqlite" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 10 |
        Remove-Item -Force
}

# Step 1: Pull latest code from GitHub
Write-Host "[1/3] Pulling latest code from GitHub..." -ForegroundColor Yellow
git fetch origin
git reset --hard origin/main
git clean -fd
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git pull failed. Check internet connection." -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 2: Install backend runtime packages (no build needed - dist/ shipped via git)
Write-Host ""
Write-Host "[2/3] Installing packages..." -ForegroundColor Yellow
Set-Location $projectPath
npm install --omit=dev
Set-Location $frontendPath
npm install --omit=dev --legacy-peer-deps
Set-Location $projectPath
Write-Host "Done." -ForegroundColor Green

# Step 2b: Generate SSL certs for HTTPS (PWA support on other devices)
$sslDir  = "$frontendPath\ssl"
$sslCert = "$sslDir\server.crt"
if (-not (Test-Path $sslCert)) {
    Write-Host ""
    Write-Host "[SSL] Generating HTTPS certificate for PWA support..." -ForegroundColor Yellow
    Set-Location $frontendPath
    node generate-ssl.cjs
    Set-Location $projectPath
    Write-Host "[SSL] Done." -ForegroundColor Green
} else {
    Write-Host "[SSL] Certificate already exists — skipping generation." -ForegroundColor DarkGray
}

# Step 3: Restart services
Write-Host ""
Write-Host "[3/3] Restarting services..." -ForegroundColor Yellow
Set-Location $projectPath

# Delete any stale/corrupt isp-frontend-8080 entry, then start it fresh
pm2 delete isp-frontend-8080 2>&1 | Out-Null
pm2 start ecosystem.config.js --only isp-frontend-8080

# Reload existing backend + isp-frontend processes
pm2 reload isp-backend --update-env
pm2 reload isp-frontend --update-env
pm2 save
Write-Host "Done." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Update completed successfully!"        -ForegroundColor Green
Write-Host "   http://${PC2_IP}:5173"                -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""

Stop-Transcript | Out-Null
