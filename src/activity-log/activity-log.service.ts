import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(logData: Partial<ActivityLog>, user: User): Promise<ActivityLog> {
    const newLog = this.activityLogRepository.create({
      ...logData,
      user,
      userId: user.id,
    });
    return this.activityLogRepository.save(newLog);
  }

  async findAll(): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: { timestamp: 'DESC' },
      relations: ['user'],
    });
  }
}
