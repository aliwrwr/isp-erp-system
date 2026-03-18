import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './entities/system-settings.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly repo: Repository<SystemSettings>,
  ) {}

  async get(): Promise<SystemSettings> {
    let s = await this.repo.findOne({ where: { id: 1 } });
    if (!s) {
      s = this.repo.create();
      s.id = 1;
      await this.repo.save(s);
    }
    return s;
  }

  async update(data: Partial<SystemSettings>): Promise<SystemSettings> {
    let s = await this.repo.findOne({ where: { id: 1 } });
    if (!s) {
      s = this.repo.create();
      s.id = 1;
    }
    // Strip id from incoming data to prevent override
    const { id: _, ...safe } = data as any;
    Object.assign(s, safe);
    return this.repo.save(s);
  }
}
