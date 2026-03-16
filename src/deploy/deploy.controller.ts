import { Controller, Post, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

const DEPLOY_SECRET = 'isp-deploy-secret-2026';

@Controller('deploy')
export class DeployController {
  @Post()
  @HttpCode(200)
  trigger(@Headers('x-deploy-secret') secret: string) {
    if (!secret || secret !== DEPLOY_SECRET) {
      throw new UnauthorizedException('Invalid deploy secret');
    }

    // Run update.ps1 completely detached so it can restart pm2 safely
    const scriptPath = path.join(process.cwd(), 'update.ps1');
    const child = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
    ], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    return { ok: true, message: 'التحديث بدأ على PC2 — انتظر دقيقة ثم تحقق من النظام' };
  }
}
