import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';
import { exec } from 'child_process';

function parsePingOutput(output: string): number | null {
  const winMatch = output.match(/Average[=\s]+(\d+)(?:ms)?/i);
  if (winMatch?.[1]) return Number(winMatch[1]);
  const unixMatch = output.match(/time=(\d+(?:\.\d+)?)\s*ms/i);
  if (unixMatch?.[1]) return Number(Number(unixMatch[1]).toFixed(0));
  return null;
}

function pingHost(host: string): Promise<number | null> {
  return new Promise(resolve => {
    const count = 1;
    const cmd = process.platform === 'win32' ? `ping -n ${count} ${host}` : `ping -c ${count} ${host}`;
    exec(cmd, { timeout: 5000 }, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      resolve(parsePingOutput(stdout));
    });
  });
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('system/stats')
  async getSystemStats(): Promise<{ cpu: number; ram: number; disk: number; uptime: number; dnsPing: number | null; googlePing: number | null }> {
    // RAM
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const ram = Math.round((totalMem - freeMem) / totalMem * 100);

    // CPU — two-sample measurement over 300ms for accuracy
    const cpu = await new Promise<number>(resolve => {
      const sample = () => {
        const cpus = os.cpus();
        let idle = 0, total = 0;
        for (const c of cpus) {
          for (const v of Object.values(c.times)) total += v;
          idle += c.times.idle;
        }
        return { idle, total };
      };
      const s1 = sample();
      setTimeout(() => {
        const s2 = sample();
        const idleDelta = s2.idle - s1.idle;
        const totalDelta = s2.total - s1.total;
        resolve(totalDelta === 0 ? 0 : Math.round((1 - idleDelta / totalDelta) * 100));
      }, 300);
    });

    // Disk
    let disk = 0;
    try {
      const fs = await import('fs');
      const mountPath = process.platform === 'win32' ? 'C:\\' : '/';
      const stat = (fs as any).statfsSync(mountPath);
      disk = Math.round((1 - stat.bfree / stat.blocks) * 100);
    } catch { disk = 0; }

    const uptime = Math.round(os.uptime());

    const [dnsPing, googlePing] = await Promise.all([
      pingHost('1.1.1.1').catch(() => null),
      pingHost('google.com').catch(() => null),
    ]);

    return { cpu, ram, disk, uptime, dnsPing, googlePing };
  }
}
