import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';
export declare class InvoiceItem {
    id: number;
    invoice: Invoice;
    product: Product;
    name: string;
    quantity: number;
    price: number;
}
