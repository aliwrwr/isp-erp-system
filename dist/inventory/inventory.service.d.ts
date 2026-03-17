import { Repository, DataSource } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Product } from '../products/entities/product.entity';
export declare class InventoryService {
    private movementsRepository;
    private productsRepository;
    private dataSource;
    constructor(movementsRepository: Repository<InventoryMovement>, productsRepository: Repository<Product>, dataSource: DataSource);
    create(dto: CreateInventoryMovementDto): Promise<InventoryMovement>;
    findAll(): Promise<InventoryMovement[]>;
    findOne(id: number): Promise<InventoryMovement | null>;
    remove(id: number): Promise<void>;
    getStats(): Promise<{
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
        totalCostValue: number;
        totalRetailValue: number;
    }>;
    getStockSummary(): Promise<{
        id: number;
        name: string;
        barcode: string | null;
        category: string | null;
        supplier: string | null;
        price: number;
        cost: number | null;
        stock: number;
        stockCostValue: number;
        stockRetailValue: number;
        totalSold: number;
        totalRevenue: number;
        stockStatus: "out" | "low" | "ok";
    }[]>;
}
