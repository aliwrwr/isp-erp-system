import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService implements OnModuleInit {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
  ) {}

  async onModuleInit() {
    try {
      const adminGroup = await this.repo.findOne({ where: { name: 'admin' } });
      if (adminGroup && adminGroup.permissions !== '["*"]') {
        adminGroup.permissions = '["*"]';
        await this.repo.save(adminGroup);
        this.logger.log('Updated "admin" group permissions to comprehensive ["*"]');
      }
    } catch (e) {
      this.logger.error('Failed to auto-seed admin group permissions', e);
    }
  }

  create(dto: CreateGroupDto): Promise<Group> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Group[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findOne(id: number): Promise<Group | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, dto: UpdateGroupDto): Promise<Group | null> {
    await this.repo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async removeAll(): Promise<void> {
    await this.repo.clear();
  }
}
