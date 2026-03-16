Set-Location "c:\Users\OMC\isp-erp-system\frontend"
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }
npm install --force
Write-Host "===INSTALL DONE==="
