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
    # New commits but GitHub is blocked — copy dist/ directly over LAN
    Write-Host "  تحذير: GitHub محجوب — جاري النشر المباشر عبر الشبكة المحلية..." -ForegroundColor Yellow
    $pc2Share    = "\\192.200.251.4\D`$\isp-erp-system"
    $backendDist = ".\dist"
    $frontDist   = ".\frontend\dist"

    if (Test-Path $pc2Share) {
        Write-Host "  نسخ dist (backend)..." -ForegroundColor Yellow
        robocopy $backendDist "$pc2Share\dist" /MIR /NJH /NJS /NDL /R:1 /W:1 | Out-Null

        Write-Host "  نسخ frontend\dist..." -ForegroundColor Yellow
        robocopy $frontDist "$pc2Share\frontend\dist" /MIR /NJH /NJS /NDL /R:1 /W:1 | Out-Null

        Write-Host "  إعادة تشغيل PM2 على PC2 عبر API..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        try {
            Invoke-RestMethod -Uri "$PC2_URL/deploy/restart" `
                -Method POST `
                -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
                -TimeoutSec 15 | Out-Null
            Write-Host "  ✓ تم النسخ وإعادة تشغيل PM2 بنجاح" -ForegroundColor Green
            $pc2Updated = $true
        } catch {
            Write-Host "  تعذّر الاتصال بـ PC2 لإعادة التشغيل" -ForegroundColor Red
            Write-Host "  شغّل هذا يدوياً على PC2:" -ForegroundColor Yellow
            Write-Host "    pm2 restart isp-backend" -ForegroundColor Cyan
            Write-Host "    pm2 restart isp-frontend" -ForegroundColor Cyan
            $pc2Updated = $true
        }
    } else {
        Write-Host "  تعذّر الوصول إلى $pc2Share" -ForegroundColor Red
        Write-Host "  تأكد من:" -ForegroundColor Yellow
        Write-Host "    1. تفعيل المشاركة الإدارية على PC2 (D`$)" -ForegroundColor Yellow
        Write-Host "    2. أو فعّل VPN وشغّل deploy.ps1 مجدداً" -ForegroundColor Yellow
    }
}

if ($pc2Updated) {
    Write-Host "  تحقق من: http://192.200.251.4:8080" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          اكتمل النشر بنجاح!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
