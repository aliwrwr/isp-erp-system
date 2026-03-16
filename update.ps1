# ===========================================
# ISP ERP System - Update Script
# Run this on the second PC to pull updates
# ===========================================

$projectPath = "C:\Users\A\isp-erp-system"
$frontendPath = "$projectPath\frontend"
$envFile = "$frontendPath\.env.production"
$envContent = "VITE_API_URL=http://192.168.200.29:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ISP ERP System - Update" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location $projectPath

# Step 1: Pull latest code
Write-Host "[1/4] Pulling latest code from GitHub..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git pull failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 2: Install backend dependencies (if package.json changed)
Write-Host "`n[2/4] Installing backend dependencies..." -ForegroundColor Yellow
npm install --production
Write-Host "Done." -ForegroundColor Green

# Step 3: Build backend
Write-Host "`n[3/4] Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 4: Build frontend
Write-Host "`n[4/4] Building frontend..." -ForegroundColor Yellow
Set-Location $frontendPath
npm install
# Restore .env.production (it's in .gitignore so git pull deletes it)
Set-Content -Path $envFile -Value $envContent
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green

# Step 5: Restart services
Write-Host "`nRestarting services..." -ForegroundColor Yellow
pm2 restart isp-backend
pm2 restart isp-frontend
pm2 save

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Update complete!" -ForegroundColor Green
Write-Host "  http://192.168.200.29:5173" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
