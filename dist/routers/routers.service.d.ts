import { Repository } from 'typeorm';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { Router } from './entities/router.entity';
export declare class RoutersService {
    private routersRepository;
    constructor(routersRepository: Repository<Router>);
    create(createRouterDto: CreateRouterDto): Promise<Router>;
    findAll(): Promise<Router[]>;
    findOne(id: number): Promise<Router | null>;
    update(id: number, updateRouterDto: UpdateRouterDto): Promise<Router | null>;
    remove(id: number): Promise<void>;
}
