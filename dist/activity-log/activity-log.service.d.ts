import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { User } from '../users/entities/user.entity';
export declare class ActivityLogService {
    private activityLogRepository;
    constructor(activityLogRepository: Repository<ActivityLog>);
    create(logData: Partial<ActivityLog>, user: User): Promise<ActivityLog>;
    findAll(): Promise<ActivityLog[]>;
}
