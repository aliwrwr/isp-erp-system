const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(process.cwd(), 'update.ps1');
const vbsPath = path.join(process.cwd(), 'run-update.vbs');

const vbsContent = `
Set objShell = WScript.CreateObject("WScript.Shell")
objShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""${scriptPath}""", 0, False
`;

fs.writeFileSync(vbsPath, vbsContent);
execSync(`cscript.exe //Nologo "${vbsPath}"`);
console.log('Fired');