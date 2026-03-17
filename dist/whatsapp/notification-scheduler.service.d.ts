import { Repository } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { WhatsappService } from './whatsapp.service';
export declare class NotificationSchedulerService {
    private subscriptionsRepository;
    private whatsappService;
    private readonly logger;
    constructor(subscriptionsRepository: Repository<Subscription>, whatsappService: WhatsappService);
    sendDailyNotifications(): Promise<void>;
    sendNowForDate(targetDate?: Date): Promise<{
        sent: number;
        failed: number;
    }>;
    getExpiringSoon(days?: number): Promise<any[]>;
    private formatDate;
}
