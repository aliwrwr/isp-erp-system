import { Controller, Post, Get, Headers, UnauthorizedException, HttpCode, UseGuards } from '@nestjs/common';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync, existsSync } from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const DEPLOY_SECRET = 'isp-deploy-secret-2026';

@Controller('deploy')
export class DeployController {
  private readonly logFile = path.join(process.cwd(), 'logs', 'deploy-update.log');

  @Post()
  @HttpCode(200)
  trigger(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }
    return this.runUpdate();
  }

  @Get('logs')
  getLogs(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }
    if (!existsSync(this.logFile)) {
      return { ok: false, log: 'لم يتم تشغيل أي تحديث بعد على هذا الجهاز.' };
    }
    // PowerShell 5.1 Start-Transcript writes UTF-16 LE; strip null bytes when read as UTF-8
    const content = readFileSync(this.logFile, 'utf8').replace(/\0/g, '');
    // Return last 200 lines to keep the response small
    const lines = content.split(/\r?\n/).slice(-200).join('\n');
    return { ok: true, log: lines };
  }

  // ── JWT-protected endpoints (for the admin UI button) ──────────────

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  @HttpCode(200)
  triggerAdmin() {
    return this.runUpdate();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/logs')
  getAdminLogs() {
    if (!existsSync(this.logFile)) {
      return { ok: false, log: 'لم يتم تشغيل أي تحديث بعد على هذا الجهاز.' };
    }
    // PowerShell 5.1 Start-Transcript writes UTF-16 LE; strip null bytes when read as UTF-8
    const content = readFileSync(this.logFile, 'utf8').replace(/\0/g, '');
    const lines = content.split(/\r?\n/).slice(-300).join('\n');
    return { ok: true, log: lines };
  }

  // ── restart only (no git pull) — used by direct-copy deploy fallback ──

  @Post('restart')
  @HttpCode(200)
  restart(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }
    const pm2 = `${process.env.APPDATA}\\npm\\pm2.cmd`;
    const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
    const scriptPath = path.join(tempDir, 'isp-pm2-restart.ps1');

    // Write a standalone restart script to disk
    writeFileSync(
      scriptPath,
      `# ISP ERP PM2 Restart Script\r\n` +
      `Start-Sleep -Seconds 10\r\n` +
      `& "${pm2}" resurrect\r\n` +
      `Start-Sleep -Seconds 3\r\n` +
      `& "${pm2}" restart isp-backend\r\n` +
      `Start-Sleep -Seconds 5\r\n` +
      `& "${pm2}" restart isp-frontend\r\n` +
      `& "${pm2}" save\r\n`,
    );

    // Use Start-Process so the new PowerShell is NOT a child of Node.js.
    // When PM2 kills this Node process, the restarted PowerShell keeps running.
    spawn(
      'powershell.exe',
      [
        '-NonInteractive', '-WindowStyle', 'Hidden',
        '-Command',
        `Start-Process powershell.exe -WindowStyle Hidden -ArgumentList '-NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${scriptPath}"'`,
      ],
      { detached: true, stdio: 'ignore', windowsHide: true },
    ).unref();

    return { ok: true, message: 'PM2 restart triggered' };
  }

  // ── shared update logic ────────────────────────────────────────────

  private runUpdate() {
    const scriptPath = path.join(process.cwd(), 'update.ps1');
    mkdirSync(path.dirname(this.logFile), { recursive: true });
    const fd = openSync(this.logFile, 'w');
    const child = spawn(
      'cmd.exe',
      ['/c', 'start', '', '/B', 'powershell.exe',
        '-ExecutionPolicy', 'Bypass',
        '-NonInteractive',
        '-File', scriptPath],
      { detached: true, stdio: ['ignore', fd, fd], windowsHide: true },
    );
    closeSync(fd);
    child.unref();
    return { ok: true, message: 'التحديث بدأ — انتظر دقيقة ثم راجع السجل' };
  }
}
