import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';
export declare class UpdateSubscriptionDto {
    subscriber?: Subscriber;
    package?: Package;
    startDate?: Date;
    endDate?: Date;
    price?: number;
    paymentMethod?: string;
    status?: string;
    paidAmount?: number;
}
