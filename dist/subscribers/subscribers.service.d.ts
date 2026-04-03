import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Package } from '../packages/entities/package.entity';
import { Router } from '../routers/entities/router.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MikrotikService } from '../routers/mikrotik.service';
export declare class SubscribersService {
    private subscribersRepository;
    private subscriptionsRepository;
    private packagesRepository;
    private routerRepository;
    private readonly whatsappService;
    private readonly mikrotikService;
    constructor(subscribersRepository: Repository<Subscriber>, subscriptionsRepository: Repository<Subscription>, packagesRepository: Repository<Package>, routerRepository: Repository<Router>, whatsappService: WhatsappService, mikrotikService: MikrotikService);
    private syncPppoe;
    create(createSubscriberDto: CreateSubscriberDto): Promise<Subscriber>;
    findAll(): Promise<Subscriber[]>;
    findOne(id: number): Promise<Subscriber | null>;
    update(id: number, updateSubscriberDto: UpdateSubscriberDto): Promise<Subscriber | null>;
    suspend(id: number): Promise<Subscriber | null>;
    activate(id: number): Promise<Subscriber | null>;
    remove(id: number): Promise<void>;
    syncToRouter(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
