import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Manager } from './entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private managersRepository: Repository<Manager>,
  ) {}

  async create(dto: CreateManagerDto): Promise<Manager> {
    const data: any = { ...dto };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const entity = this.managersRepository.create(data as Manager);
    return this.managersRepository.save(entity);
  }

  async findAll(): Promise<any[]> {
    const managers = await this.managersRepository.find({ order: { name: 'ASC' } });
    try {
      const counts: { managerId: number; count: string }[] = await this.managersRepository.manager.query(
        `SELECT "managerId", COUNT(*) as count FROM "subscribers" WHERE "managerId" IS NOT NULL GROUP BY "managerId"`,
      );
      const countMap = new Map(counts.map(r => [r.managerId, Number(r.count)]));
      return managers.map(m => ({ ...m, subscriberCount: countMap.get(m.id) ?? 0 }));
    } catch {
      // subscriber count is optional — return managers without it if query fails
      return managers.map(m => ({ ...m, subscriberCount: 0 }));
    }
  }

  findOne(id: number): Promise<Manager | null> {
    return this.managersRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateManagerDto): Promise<Manager | null> {
    const data: any = { ...dto };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.managersRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.managersRepository.delete(id);
  }

  findByUsername(username: string): Promise<Manager | null> {
    return this.managersRepository.findOneBy({ username });
  }
}
