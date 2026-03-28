
Set objShell = WScript.CreateObject("WScript.Shell")
objShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""C:\Users\OMC\isp-erp-system\update.ps1""", 0, False
