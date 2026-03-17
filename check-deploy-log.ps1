# check-deploy-log.ps1
# Run this on PC1 to read the update log from PC2 after deploying.
# Usage:  powershell -ExecutionPolicy Bypass -File .\check-deploy-log.ps1

$PC2_URL       = "http://192.200.251.4:3000"
$DEPLOY_SECRET = "isp-deploy-secret-2026"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   سجل آخر تحديث على PC2               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $resp = Invoke-RestMethod `
        -Uri "$PC2_URL/deploy/logs" `
        -Method GET `
        -Headers @{ "x-deploy-secret" = $DEPLOY_SECRET } `
        -TimeoutSec 10

    if ($resp.ok) {
        Write-Host $resp.log
    } else {
        Write-Host $resp.log -ForegroundColor Yellow
    }
} catch {
    Write-Host "تعذر الاتصال بـ PC2: $_" -ForegroundColor Red
    Write-Host "تأكد أن PC2 يعمل على http://192.200.251.4:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================"
Write-Host ""
