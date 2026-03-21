import { Repository } from 'typeorm';
import { Manager } from './entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
export declare class ManagersService {
    private managersRepository;
    constructor(managersRepository: Repository<Manager>);
    create(dto: CreateManagerDto): Promise<Manager>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<Manager | null>;
    update(id: number, dto: UpdateManagerDto): Promise<Manager | null>;
    remove(id: number): Promise<void>;
}
