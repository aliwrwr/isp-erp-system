import { Package } from '../../packages/entities/package.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Manager } from '../../managers/entities/manager.entity';
import { Router } from '../../routers/entities/router.entity';
export declare class Subscriber {
    id: number;
    name: string;
    phone: string;
    secondaryPhone: string;
    address: string;
    location: string;
    macAddress: string;
    cabinetSector: string;
    ipAddress: string;
    username: string;
    password: string;
    manager: Manager;
    package: Package;
    router: Router;
    subscriptions: Subscription[];
    status: string;
    isEnabled: boolean;
    notes: string;
    createdAt: Date;
}
