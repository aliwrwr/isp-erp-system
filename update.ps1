# ===========================================
# ISP ERP System - Update Script (PC2)
# شغّل هذا الملف على PC2 بعد كل تحديث
# ===========================================

# ====== إعدادات PC2 ======
$PC2_IP      = "192.200.251.4"
$projectPath = "D:\isp-erp-system"          # غيّر المسار إذا كان مختلفاً
$frontendPath = "$projectPath\frontend"
# =========================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ISP ERP System - Update PC2" -ForegroundColor Cyan
Write-Host "   $PC2_IP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# التحقق من وجود المجلد
if (-not (Test-Path $projectPath)) {
    Write-Host "ERROR: المجلد غير موجود: $projectPath" -ForegroundColor Red
    Write-Host "عدّل متغير projectPath في هذا الملف" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectPath

# Step 0: نسخ احتياطي لقاعدة البيانات
$dbFile = "$projectPath\isp-erp.sqlite"
if (Test-Path $dbFile) {
    $backupDir = "$projectPath\backups"
    if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $backupFile = "$backupDir\isp-erp_$timestamp.sqlite"
    Copy-Item $dbFile $backupFile
    Write-Host "[0/5] تم النسخ الاحتياطي: backups\isp-erp_$timestamp.sqlite" -ForegroundColor Cyan
    # الاحتفاظ بآخر 10 نسخ فقط
    Get-ChildItem "$backupDir\*.sqlite" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item -Force
}

# Step 1: سحب آخر التحديثات من GitHub (فرض التحديث وتجاهل التعديلات المحلية)
Write-Host "[1/5] سحب التحديثات من GitHub..." -ForegroundColor Yellow
git fetch origin
git reset --hard origin/main
git clean -fd
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: فشل git pull — تأكد من الاتصال بالإنترنت" -ForegroundColor Red
    exit 1
}
Write-Host "تم." -ForegroundColor Green

# Step 2: تثبيت حزم Backend
Write-Host "`n[2/5] تثبيت حزم Backend..." -ForegroundColor Yellow
npm install
Write-Host "تم." -ForegroundColor Green

# Step 3: بناء Backend
Write-Host "`n[3/5] بناء Backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: فشل بناء Backend!" -ForegroundColor Red
    exit 1
}
Write-Host "تم." -ForegroundColor Green

# Step 4: بناء Frontend
Write-Host "`n[4/5] بناء Frontend..." -ForegroundColor Yellow
Set-Location $frontendPath
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: فشل بناء Frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "تم." -ForegroundColor Green

# Step 5: إعادة تشغيل الخدمات
Write-Host "`n[5/5] إعادة تشغيل الخدمات..." -ForegroundColor Yellow
Set-Location $projectPath
$pm2List = pm2 jlist 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($pm2List -and $pm2List.Count -gt 0) {
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
Write-Host "تم." -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   التحديث اكتمل بنجاح!" -ForegroundColor Green
Write-Host "   http://${PC2_IP}:5173" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
