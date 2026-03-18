import { Repository } from 'typeorm';
import { RoutersService } from './routers.service';
import { MikrotikService } from './mikrotik.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
export declare class RoutersController {
    private readonly routersService;
    private readonly mikrotikService;
    private subscriberRepo;
    constructor(routersService: RoutersService, mikrotikService: MikrotikService, subscriberRepo: Repository<Subscriber>);
    getAllConnections(): Promise<any[]>;
    disconnectSession(id: string, body: {
        sessionId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    create(createRouterDto: CreateRouterDto): Promise<import("./entities/router.entity").Router>;
    findAll(): Promise<import("./entities/router.entity").Router[]>;
    findOne(id: string): Promise<import("./entities/router.entity").Router | null>;
    update(id: string, updateRouterDto: UpdateRouterDto): Promise<import("./entities/router.entity").Router | null>;
    remove(id: string): Promise<void>;
    getStatus(id: string): Promise<import("./mikrotik.service").RouterStatus>;
    getInterfaces(id: string): Promise<import("./mikrotik.service").RouterInterface[]>;
    getActiveConnections(id: string): Promise<import("./mikrotik.service").ActiveConnection[]>;
    getIpAddresses(id: string): Promise<any[]>;
    ping(id: string): Promise<{
        online: boolean;
    }>;
}
