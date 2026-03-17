import { Product } from '../../products/entities/product.entity';
export declare class CreateInventoryMovementDto {
    product: Product;
    type: string;
    quantity: number;
    reference?: string;
    notes?: string;
}
