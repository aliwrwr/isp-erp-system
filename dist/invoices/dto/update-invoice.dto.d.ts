import { User } from '../../users/entities/user.entity';
declare class InvoiceItemDto {
    productId?: number;
    quantity?: number;
    price?: number;
}
export declare class UpdateInvoiceDto {
    customer?: User;
    items?: InvoiceItemDto[];
    total?: number;
    discount?: number;
    tax?: number;
    paymentMethod?: string;
}
export {};
