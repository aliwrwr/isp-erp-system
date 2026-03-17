# ============================================================
#  Deploy: PC1 → GitHub → PC2
# ============================================================

$PC2_URL      = "http://192.200.251.4:3000"
$DEPLOY_SECRET = "isp-deploy-secret-2026"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         ISP ERP - نظام النشر           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ---------- Step 1: Git ----------------------------------------
Write-Host "`n[1/3] فحص التغييرات..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

$changes = git status --short
if (-not $changes) {
    Write-Host "  لا توجد تغييرات جديدة" -ForegroundColor Gray
} else {
    Write-Host $changes
    $msg = Read-Host "`n  رسالة التحديث (اضغط Enter للتخطي)"
    if (-not $msg) { $msg = "تحديث $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    git add .
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) { Write-Host "فشل git commit!" -ForegroundColor Red; exit 1 }
    Write-Host "  تم الـ commit" -ForegroundColor Green
}

# ---------- Step 2: Push to GitHub ----------------------------
Write-Host "`n[2/3] رفع إلى GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  فشل git push!" -ForegroundColor Red
    exit 1
}
Write-Host "  تم الرفع إلى GitHub ✓" -ForegroundColor Green

# ---------- Step 3: Trigger PC2 -------------------------------
Write-Host "`n[3/3] تشغيل التحديث على PC2..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod `
        -Uri "$PC2_URL/deploy" `
        -Method POST `
        -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
        -TimeoutSec 15
    Write-Host "  PC2 يقوم بالتحديث الآن ✓" -ForegroundColor Green
    Write-Host "  انتظر دقيقتين ثم نفّذ للتحقق من التقدم:" -ForegroundColor Cyan
    Write-Host "    powershell -File .\check-deploy-log.ps1" -ForegroundColor Gray
    Write-Host "  أو تحقق من: http://192.200.251.4:5173" -ForegroundColor Cyan
} catch {
    Write-Host "  تعذر الاتصال بـ PC2 تلقائياً" -ForegroundColor Yellow
    Write-Host "  شغّل update.ps1 يدوياً على PC2" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          اكتمل النشر بنجاح!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
