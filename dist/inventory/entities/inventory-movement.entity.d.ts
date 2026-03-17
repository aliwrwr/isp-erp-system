import { Product } from '../../products/entities/product.entity';
export declare class InventoryMovement {
    id: number;
    product: Product;
    type: string;
    quantity: number;
    reference: string;
    notes: string;
    date: Date;
}
