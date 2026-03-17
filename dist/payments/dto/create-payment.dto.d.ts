import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
export declare class CreatePaymentDto {
    subscriber?: Subscriber;
    subscription?: Subscription;
    amount: number;
    method?: string;
    notes?: string;
}
