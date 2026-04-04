import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
export declare class ActivityLogService {
    private activityLogRepository;
    constructor(activityLogRepository: Repository<ActivityLog>);
    create(logData: Partial<ActivityLog>, user: any): Promise<ActivityLog>;
    findAll(): Promise<ActivityLog[]>;
}
