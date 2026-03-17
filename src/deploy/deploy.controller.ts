import { Controller, Post, Get, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync, openSync, closeSync, existsSync } from 'fs';
import * as path from 'path';

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

    const scriptPath = path.join(process.cwd(), 'update.ps1');
    mkdirSync(path.dirname(this.logFile), { recursive: true });

    // Redirect stdout+stderr to log file so every step is visible.
    // Use cmd /c start "" to create a brand-new process group on Windows,
    // so the script survives even when PM2 restarts (kills) this backend.
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

    return { ok: true, message: 'التحديث بدأ على PC2 — انتظر دقيقة ثم نفّذ: .\\check-deploy-log.ps1' };
  }

  @Get('logs')
  getLogs(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }
    if (!existsSync(this.logFile)) {
      return { ok: false, log: 'لم يتم تشغيل أي تحديث بعد على هذا الجهاز.' };
    }
    const content = readFileSync(this.logFile, 'utf8');
    // Return last 200 lines to keep the response small
    const lines = content.split(/\r?\n/).slice(-200).join('\n');
    return { ok: true, log: lines };
  }
}
