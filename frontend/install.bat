@echo off
cd /d c:\Users\OMC\isp-erp-system\frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
call npm install --force
echo ===INSTALL DONE===
