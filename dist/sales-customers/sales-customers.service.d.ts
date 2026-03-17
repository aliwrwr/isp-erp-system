import { Repository } from 'typeorm';
import { SalesCustomer } from './entities/sales-customer.entity';
import { CreateSalesCustomerDto } from './dto/create-sales-customer.dto';
import { UpdateSalesCustomerDto } from './dto/update-sales-customer.dto';
import { Invoice } from '../invoices/entities/invoice.entity';
export declare class SalesCustomersService {
    private repo;
    private invoicesRepo;
    constructor(repo: Repository<SalesCustomer>, invoicesRepo: Repository<Invoice>);
    create(dto: CreateSalesCustomerDto): Promise<SalesCustomer>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<SalesCustomer>;
    update(id: number, dto: UpdateSalesCustomerDto): Promise<SalesCustomer>;
    remove(id: number): Promise<void>;
    getInvoices(id: number): Promise<any[]>;
    recordPayment(id: number, amount: number): Promise<{
        settled: number;
    }>;
    addCharge(id: number, amount: number, note: string): Promise<any>;
}
