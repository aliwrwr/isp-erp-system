import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
export declare class ManagersController {
    private readonly managersService;
    constructor(managersService: ManagersService);
    create(dto: CreateManagerDto): Promise<import("./entities/manager.entity").Manager>;
    findAll(): Promise<any[]>;
    findByUsername(username: string): Promise<import("./entities/manager.entity").Manager | null>;
    findOne(id: string): Promise<import("./entities/manager.entity").Manager | null>;
    update(id: string, dto: UpdateManagerDto): Promise<import("./entities/manager.entity").Manager | null>;
    remove(id: string): Promise<void>;
}
