declare class InvoiceItemDto {
    productId?: number;
    name?: string;
    quantity: number;
    price: number;
}
export declare class CreateInvoiceDto {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    items: InvoiceItemDto[];
    total: number;
    discount?: number;
    tax?: number;
    paymentMethod: string;
    paymentStatus?: string;
    paidAmount?: number;
    notes?: string;
}
export {};
