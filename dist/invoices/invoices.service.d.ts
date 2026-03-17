import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Product } from '../products/entities/product.entity';
import { SalesCustomer } from '../sales-customers/entities/sales-customer.entity';
export declare class InvoicesService {
    private invoicesRepository;
    private invoiceItemsRepository;
    private productsRepository;
    private customersRepository;
    constructor(invoicesRepository: Repository<Invoice>, invoiceItemsRepository: Repository<InvoiceItem>, productsRepository: Repository<Product>, customersRepository: Repository<SalesCustomer>);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: number): Promise<Invoice | null>;
    update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice | null>;
    remove(id: number): Promise<void>;
}
