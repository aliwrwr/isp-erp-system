import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    create(logData: any, req: any): Promise<import("./activity-log.entity").ActivityLog>;
    findAll(): Promise<import("./activity-log.entity").ActivityLog[]>;
}
