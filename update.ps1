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
pm2 restart all
pm2 save
Write-Host "تم." -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   التحديث اكتمل بنجاح!" -ForegroundColor Green
Write-Host "   http://${PC2_IP}:5173" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
