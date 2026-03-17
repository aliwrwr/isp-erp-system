import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';
export declare class Subscription {
    id: number;
    subscriber: Subscriber;
    package: Package;
    startDate: Date;
    endDate: Date;
    price: number;
    paymentMethod: string;
    status: string;
    paidAmount: number;
    debtAmount: number;
    notes: string;
}
