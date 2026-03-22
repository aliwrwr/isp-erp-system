import { Controller, Get, Delete, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { GroupsService } from './groups/groups.service';
import * as os from 'os';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly groupsService: GroupsService,
  ) {}

  // TEMPORARY one-time clear — will be removed after use
  @Delete('_temp/clear-groups/:secret')
  async clearGroupsTemp(@Param('secret') secret: string) {
    if (secret !== 'isp-clear-7x9z2026') return { error: 'forbidden' };
    await this.groupsService.removeAll();
    return { cleared: true };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('system/stats')
  async getSystemStats(): Promise<{ cpu: number; ram: number; disk: number }> {
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

    return { cpu, ram, disk };
  }
}
