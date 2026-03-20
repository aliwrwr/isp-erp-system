import { Repository } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { Router } from '../routers/entities/router.entity';
import { WhatsappService } from './whatsapp.service';
import { MikrotikService } from '../routers/mikrotik.service';
export declare class NotificationSchedulerService {
    private subscriptionsRepository;
    private subscriberRepository;
    private routerRepository;
    private whatsappService;
    private readonly mikrotikService;
    private readonly logger;
    constructor(subscriptionsRepository: Repository<Subscription>, subscriberRepository: Repository<Subscriber>, routerRepository: Repository<Router>, whatsappService: WhatsappService, mikrotikService: MikrotikService);
    sendDailyNotifications(): Promise<void>;
    sendNowForDate(targetDate?: Date): Promise<{
        sent: number;
        failed: number;
    }>;
    getExpiringSoon(days?: number): Promise<any[]>;
    autoExpireSubscriptions(): Promise<void>;
    private formatDate;
}
