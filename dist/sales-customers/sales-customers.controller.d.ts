import { SalesCustomersService } from './sales-customers.service';
import { CreateSalesCustomerDto } from './dto/create-sales-customer.dto';
import { UpdateSalesCustomerDto } from './dto/update-sales-customer.dto';
export declare class SalesCustomersController {
    private readonly service;
    constructor(service: SalesCustomersService);
    create(dto: CreateSalesCustomerDto): Promise<import("./entities/sales-customer.entity").SalesCustomer>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<import("./entities/sales-customer.entity").SalesCustomer>;
    update(id: string, dto: UpdateSalesCustomerDto): Promise<import("./entities/sales-customer.entity").SalesCustomer>;
    remove(id: string): Promise<void>;
    getInvoices(id: string): Promise<any[]>;
    recordPayment(id: string, body: {
        amount: number;
    }): Promise<{
        settled: number;
    }>;
    addCharge(id: string, body: {
        amount: number;
        note?: string;
    }): Promise<any>;
}
