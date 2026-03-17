import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
export declare class Package {
    id: number;
    name: string;
    downloadSpeed: number;
    uploadSpeed: number;
    price: number;
    duration: number;
    dataLimit: number;
    routerProfile: string;
    subscribers: Subscriber[];
    subscriptions: Subscription[];
}
