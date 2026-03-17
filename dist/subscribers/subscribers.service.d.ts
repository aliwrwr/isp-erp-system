import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Package } from '../packages/entities/package.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class SubscribersService {
    private subscribersRepository;
    private subscriptionsRepository;
    private packagesRepository;
    private readonly whatsappService;
    constructor(subscribersRepository: Repository<Subscriber>, subscriptionsRepository: Repository<Subscription>, packagesRepository: Repository<Package>, whatsappService: WhatsappService);
    create(createSubscriberDto: CreateSubscriberDto): Promise<Subscriber>;
    findAll(): Promise<Subscriber[]>;
    findOne(id: number): Promise<Subscriber | null>;
    update(id: number, updateSubscriberDto: UpdateSubscriberDto): Promise<Subscriber | null>;
    remove(id: number): Promise<void>;
}
