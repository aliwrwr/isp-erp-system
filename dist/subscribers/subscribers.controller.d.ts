import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
export declare class SubscribersController {
    private readonly subscribersService;
    constructor(subscribersService: SubscribersService);
    findAll(): Promise<import("./entities/subscriber.entity").Subscriber[]>;
    findOne(id: string): Promise<import("./entities/subscriber.entity").Subscriber | null>;
    create(createSubscriberDto: CreateSubscriberDto): Promise<import("./entities/subscriber.entity").Subscriber>;
    update(id: string, updateSubscriberDto: UpdateSubscriberDto): Promise<import("./entities/subscriber.entity").Subscriber | null>;
    remove(id: string): Promise<void>;
}
