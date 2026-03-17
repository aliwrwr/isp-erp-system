import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(dto: CreateInventoryMovementDto): Promise<import("./entities/inventory-movement.entity").InventoryMovement>;
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
    findAll(): Promise<import("./entities/inventory-movement.entity").InventoryMovement[]>;
    findOne(id: string): Promise<import("./entities/inventory-movement.entity").InventoryMovement | null>;
    remove(id: string): Promise<void>;
}
