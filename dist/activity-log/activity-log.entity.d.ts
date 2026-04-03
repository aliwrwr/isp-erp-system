import { User } from '../users/entities/user.entity';
export declare class ActivityLog {
    id: number;
    action: string;
    module: string;
    details: string;
    subscriberName: string;
    amount: number;
    timestamp: Date;
    user: User;
    userId: number;
}
