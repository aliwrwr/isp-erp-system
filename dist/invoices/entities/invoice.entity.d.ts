import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';
export declare class Invoice {
    id: number;
    invoiceNumber: string;
    customer: User;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: InvoiceItem[];
    total: number;
    discount: number;
    tax: number;
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
    notes: string;
    date: Date;
}
