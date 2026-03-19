import { Controller, Post, Get, Headers, UnauthorizedException, HttpCode, UseGuards } from '@nestjs/common';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync, openSync, closeSync, existsSync } from 'fs';
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
    const child = spawn(
      'cmd.exe',
      ['/c', 'start', '', '/B', 'powershell.exe',
        '-ExecutionPolicy', 'Bypass',
        '-NonInteractive',
        '-Command', 'pm2 restart isp-backend; pm2 restart isp-frontend; pm2 save'],
      { detached: true, stdio: 'ignore', windowsHide: true },
    );
    child.unref();
    return { ok: true, message: 'PM2 reload triggered' };
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
