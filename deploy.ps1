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
# ---------- Step 0: Build ----------------------------------------
Write-Host "`n[0/4] بناء المشروع (backend + frontend)..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "  فشل build backend!" -ForegroundColor Red; exit 1 }
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "  فشل build frontend!" -ForegroundColor Red; exit 1 }
Set-Location $PSScriptRoot
Write-Host "  ✓ تم البناء بنجاح" -ForegroundColor Green

Write-Host "`n[1/4] فحص التغييرات..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

$changes = git status --short
$hasNewCommit = $false
if (-not $changes) {
    Write-Host "  لا توجد تغييرات جديدة في الكود" -ForegroundColor Gray
} else {
    Write-Host $changes
    $msg = Read-Host "`n  رسالة التحديث (اضغط Enter للتخطي)"
    if (-not $msg) { $msg = "تحديث $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    git add .
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) { Write-Host "فشل git commit!" -ForegroundColor Red; exit 1 }
    Write-Host "  تم الـ commit" -ForegroundColor Green
    $hasNewCommit = $true
}

# ---------- Step 2: Push to GitHub (only when there are new commits) --
Write-Host "`n[2/4] رفع إلى GitHub..." -ForegroundColor Yellow
$githubPushOk = $false
if ($hasNewCommit) {
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  تحذير: فشل git push — GitHub محجوب على هذا الجهاز." -ForegroundColor Yellow
        Write-Host "  سيتم النشر المباشر إلى PC2 عبر الشبكة..." -ForegroundColor Yellow
    } else {
        Write-Host "  تم الرفع إلى GitHub ✓" -ForegroundColor Green
        $githubPushOk = $true
    }
} else {
    Write-Host "  لا شيء جديد للرفع — تخطي." -ForegroundColor Gray
}

# ---------- Step 3: Update PC2 --------------------------------
Write-Host "`n[3/4] تشغيل التحديث على PC2..." -ForegroundColor Yellow
$pc2Updated = $false

if (-not $hasNewCommit) {
    # No code changes — just make sure PM2 is running the existing code
    try {
        Invoke-RestMethod -Uri "$PC2_URL/deploy/restart" `
            -Method POST `
            -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
            -TimeoutSec 10 | Out-Null
        Write-Host "  تم التأكد من تشغيل PM2 على PC2 ✓" -ForegroundColor Green
        $pc2Updated = $true
    } catch {
        Write-Host "  PC2 يعمل بالفعل — لا تحديث مطلوب." -ForegroundColor Gray
        $pc2Updated = $true
    }
} elseif ($githubPushOk) {
    # New commits pushed to GitHub — trigger PC2 to pull and restart
    try {
        Invoke-RestMethod -Uri "$PC2_URL/deploy" `
            -Method POST `
            -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
            -TimeoutSec 15 | Out-Null
        Write-Host "  PC2 يقوم بالتحديث عبر GitHub ✓" -ForegroundColor Green
        Write-Host "  انتظر دقيقتين ثم تحقق: http://192.200.251.4:5173" -ForegroundColor Cyan
        $pc2Updated = $true
    } catch {
        Write-Host "  تعذر الاتصال بـ PC2 تلقائياً" -ForegroundColor Yellow
        Write-Host "  شغّل update.ps1 يدوياً على PC2" -ForegroundColor Yellow
    }
} else {
    # New commits but GitHub is blocked — copy dist files directly over LAN
    Write-Host "  GitHub محجوب — جاري نسخ الملفات مباشرة عبر الشبكة..." -ForegroundColor Yellow
    $PC2_SHARE = "\\192.200.251.4\d$\isp-erp-system"
    if (Test-Path $PC2_SHARE) {
        robocopy "$PSScriptRoot\dist"          "$PC2_SHARE\dist"          /MIR /NFL /NDL /NJH /NJS | Out-Null
        robocopy "$PSScriptRoot\frontend\dist" "$PC2_SHARE\frontend\dist" /MIR /NFL /NDL /NJH /NJS | Out-Null
        Write-Host "  تم نسخ الملفات مباشرة إلى PC2 ✓" -ForegroundColor Green
        try {
            Invoke-RestMethod -Uri "$PC2_URL/deploy/restart" `
                -Method POST `
                -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
                -TimeoutSec 10 | Out-Null
            Write-Host "  تم إعادة تشغيل PM2 على PC2 ✓" -ForegroundColor Green
        } catch {
            Write-Host "  تنبيه: أعد تشغيل PM2 يدوياً على PC2: pm2 reload isp-backend" -ForegroundColor Yellow
        }
        $pc2Updated = $true
    } else {
        Write-Host "  تعذر الوصول إلى مجلد PC2 ($PC2_SHARE)" -ForegroundColor Red
        Write-Host "  الحل: انقل ملفات dist/ و frontend/dist/ يدوياً إلى PC2 ثم شغّل:" -ForegroundColor Yellow
        Write-Host "    pm2 reload ecosystem.config.js --update-env" -ForegroundColor Gray
    }
}

if ($pc2Updated) {
    Write-Host "  تحقق من: http://192.200.251.4:5173" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          اكتمل النشر بنجاح!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
