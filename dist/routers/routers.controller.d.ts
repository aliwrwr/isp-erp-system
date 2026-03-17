import { RoutersService } from './routers.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
export declare class RoutersController {
    private readonly routersService;
    constructor(routersService: RoutersService);
    create(createRouterDto: CreateRouterDto): Promise<import("./entities/router.entity").Router>;
    findAll(): Promise<import("./entities/router.entity").Router[]>;
    findOne(id: string): Promise<import("./entities/router.entity").Router | null>;
    update(id: string, updateRouterDto: UpdateRouterDto): Promise<import("./entities/router.entity").Router | null>;
    remove(id: string): Promise<void>;
}
