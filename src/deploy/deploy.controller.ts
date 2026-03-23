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
    const tempDir = process.env.TEMP ?? `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
    const scriptPath = path.join(tempDir, 'isp-pm2-restart.ps1');

    // Write restart script to disk
    writeFileSync(
      scriptPath,
      `& "${pm2}" restart isp-backend\r\n` +
      `Start-Sleep -Seconds 8\r\n` +
      `& "${pm2}" restart isp-frontend\r\n` +
      `& "${pm2}" save\r\n`,
    );

    // Schedule via Windows Task Scheduler — runs inside svchost.exe, completely
    // independent of this Node.js process and PM2 Job Objects.
    // 2-minute delay guarantees the HTTP response is sent before restart begins.
    const future = new Date(Date.now() + 120000);
    const timeStr = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(future.getMonth() + 1).padStart(2, '0')}/${String(future.getDate()).padStart(2, '0')}/${future.getFullYear()}`;

    spawn(
      'schtasks',
      [
        '/create', '/f',
        '/tn', 'ISP-PM2-Restart',
        '/sc', 'once',
        '/sd', dateStr,
        '/st', timeStr,
        '/tr', `powershell.exe -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${scriptPath}"`,
      ],
      { stdio: 'ignore', windowsHide: true, detached: true },
    ).unref();

    return { ok: true, message: `PM2 restart scheduled at ${timeStr}` };
  }

  // ── full PM2 daemon reset (kills all, restarts from ecosystem.config.js) ──

  @Post('fix-pm2')
  @HttpCode(200)
  fixPm2(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }

    const pm2Cmd = `${process.env.APPDATA}\\npm\\pm2.cmd`;
    const projectPath = process.cwd();
    const tempDir = process.env.TEMP ?? `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
    const scriptPath = path.join(tempDir, 'isp-pm2-full-reset.ps1');

    // Write a script that kills the PM2 daemon and starts from scratch.
    // This runs OUTSIDE PM2 (via schtasks/svchost) so it survives pm2 kill.
    const script =
      `Start-Sleep -Seconds 10\r\n` +
      `& "${pm2Cmd}" kill\r\n` +
      `Start-Sleep -Seconds 5\r\n` +
      `Set-Location "${projectPath}"\r\n` +
      `& "${pm2Cmd}" start ecosystem.config.js\r\n` +
      `& "${pm2Cmd}" save\r\n`;

    writeFileSync(scriptPath, script);

    const future = new Date(Date.now() + 30000);
    const timeStr = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(future.getMonth() + 1).padStart(2, '0')}/${String(future.getDate()).padStart(2, '0')}/${future.getFullYear()}`;

    spawn(
      'schtasks',
      [
        '/create', '/f',
        '/tn', 'ISP-PM2-Full-Reset',
        '/sc', 'once',
        '/sd', dateStr,
        '/st', timeStr,
        '/tr', `powershell.exe -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${scriptPath}"`,
      ],
      { stdio: 'ignore', windowsHide: true, detached: true },
    ).unref();

    return {
      ok: true,
      message: `PM2 full reset scheduled at ${timeStr} — all services will restart in ~30-60s`,
    };
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
