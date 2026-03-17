import { Category } from '../../categories/entities/category.entity';
import { InvoiceItem } from '../../invoices/entities/invoice-item.entity';
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    cost: number;
    barcode: string;
    category: Category;
    supplier: string;
    stock: number;
    invoiceItems: InvoiceItem[];
}
