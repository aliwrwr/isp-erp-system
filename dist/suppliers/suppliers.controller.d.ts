import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly service;
    constructor(service: SuppliersService);
    create(dto: CreateSupplierDto): Promise<import("./entities/supplier.entity").Supplier>;
    findAll(): Promise<import("./entities/supplier.entity").Supplier[]>;
    findOne(id: string): Promise<import("./entities/supplier.entity").Supplier>;
    update(id: string, dto: UpdateSupplierDto): Promise<import("./entities/supplier.entity").Supplier>;
    remove(id: string): Promise<void>;
}
