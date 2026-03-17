import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesCustomer } from './entities/sales-customer.entity';
import { CreateSalesCustomerDto } from './dto/create-sales-customer.dto';
import { UpdateSalesCustomerDto } from './dto/update-sales-customer.dto';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class SalesCustomersService {
  constructor(
    @InjectRepository(SalesCustomer)
    private repo: Repository<SalesCustomer>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
  ) {}

  create(dto: CreateSalesCustomerDto): Promise<SalesCustomer> {
    const customer = this.repo.create(dto);
    return this.repo.save(customer);
  }

  async findAll(): Promise<any[]> {
    const customers = await this.repo.find({ order: { createdAt: 'DESC' } });

    // Enrich each customer with invoice stats matched by phone
    const invoices = await this.invoicesRepo.find();

    return customers.map(c => {
      const related = invoices.filter(inv =>
        (c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
        (!c.phone && inv.customerName === c.name),
      );
      const totalSales = related.reduce((s, i) => s + Number(i.total), 0);
      const totalDebt = related
        .filter(i => i.paymentStatus !== 'paid')
        .reduce((s, i) => s + (Number(i.total) - Number(i.paidAmount || 0)), 0);
      return { ...c, invoiceCount: related.length, totalSales, totalDebt };
    });
  }

  async findOne(id: number): Promise<SalesCustomer> {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException('العميل غير موجود');
    return c;
  }

  async update(id: number, dto: UpdateSalesCustomerDto): Promise<SalesCustomer> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
