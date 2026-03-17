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
Write-Host "[1/5] Pulling latest code from GitHub..." -ForegroundColor Yellow
git fetch origin
git reset --hard origin/main
git clean -fd
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git pull failed. Check internet connection." -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 2: Install backend packages
Write-Host ""
Write-Host "[2/5] Installing backend packages..." -ForegroundColor Yellow
npm install --include=dev
Write-Host "Done." -ForegroundColor Green

# Step 3: Build backend
Write-Host ""
Write-Host "[3/5] Building backend..." -ForegroundColor Yellow
# Use npx to ensure local nest CLI is found even without global install
npx nest build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 4: Build frontend
Write-Host ""
Write-Host "[4/5] Building frontend..." -ForegroundColor Yellow
Set-Location $frontendPath
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 5: Restart services
Write-Host ""
Write-Host "[5/5] Restarting services..." -ForegroundColor Yellow
Set-Location $projectPath
$pm2Output = pm2 list 2>$null | Out-String
if ($pm2Output -match "online|stopped|errored") {
    pm2 restart all
} elseif (Test-Path "$projectPath\ecosystem.config.js") {
    pm2 start ecosystem.config.js
} else {
    pm2 start dist/main.js --name isp-backend
    Set-Location $frontendPath
    pm2 start "npx serve dist -s -l 5173" --name isp-frontend
    Set-Location $projectPath
}
pm2 save
Write-Host "Done." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Update completed successfully!"        -ForegroundColor Green
Write-Host "   http://${PC2_IP}:5173"                -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""

Stop-Transcript | Out-Null
