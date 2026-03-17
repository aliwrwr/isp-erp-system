import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private repo;
    constructor(repo: Repository<Supplier>);
    create(dto: CreateSupplierDto): Promise<Supplier>;
    findAll(): Promise<Supplier[]>;
    findOne(id: number): Promise<Supplier>;
    update(id: number, dto: UpdateSupplierDto): Promise<Supplier>;
    remove(id: number): Promise<void>;
}
