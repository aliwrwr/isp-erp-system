import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';
export declare class CreateSubscriptionDto {
    subscriber: Subscriber;
    package?: Package;
    startDate: Date;
    endDate: Date;
    price: number;
    paidAmount?: number;
    debtAmount?: number;
    paymentMethod: string;
    status: string;
}
