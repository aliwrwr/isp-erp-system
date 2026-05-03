import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class SubscriptionsService {
    private subscriptionsRepository;
    private paymentsRepository;
    private readonly whatsappService;
    constructor(subscriptionsRepository: Repository<Subscription>, paymentsRepository: Repository<Payment>, whatsappService: WhatsappService);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    findAll(): Promise<Subscription[]>;
    findOne(id: number): Promise<Subscription | null>;
    update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription | null>;
    remove(id: number): Promise<void>;
    pay(id: number, amount: number, notes?: string): Promise<Subscription | null>;
    addDebt(id: number, amount: number, notes?: string): Promise<Subscription | null>;
    getTodayStats(): Promise<{
        collected: number;
        totalDebt: number;
        debtPayments: number;
        activations: number;
    }>;
}
