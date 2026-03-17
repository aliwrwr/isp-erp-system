import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
export declare class Payment {
    id: number;
    subscriber: Subscriber;
    subscription: Subscription;
    amount: number;
    method: string;
    status: string;
    notes: string;
    date: Date;
}
