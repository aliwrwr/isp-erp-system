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

  /** Return all invoices for a customer (matched by phone or name) */
  async getInvoices(id: number): Promise<any[]> {
    const c = await this.findOne(id);
    const invoices = await this.invoicesRepo.find({ order: { date: 'DESC' } });
    return invoices.filter(inv =>
      (c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
      (!c.phone && inv.customerName === c.name),
    );
  }

  /** Record a debt payment (reduce paidAmount gap on oldest unpaid invoices) */
  async recordPayment(id: number, amount: number): Promise<{ settled: number }> {
    const c = await this.findOne(id);
    const invoices = await this.invoicesRepo.find({ order: { date: 'ASC' } });
    const related = invoices.filter(inv =>
      inv.paymentStatus !== 'paid' &&
      ((c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
       (!c.phone && inv.customerName === c.name)),
    );
    let remaining = amount;
    for (const inv of related) {
      if (remaining <= 0) break;
      const debt = Number(inv.total) - Number(inv.paidAmount || 0);
      if (debt <= 0) continue;
      const settle = Math.min(debt, remaining);
      inv.paidAmount = Number(inv.paidAmount || 0) + settle;
      if (inv.paidAmount >= Number(inv.total)) inv.paymentStatus = 'paid';
      else inv.paymentStatus = 'partial';
      remaining -= settle;
      await this.invoicesRepo.save(inv);
    }
    return { settled: amount - remaining };
  }

  /** Add a debt charge (create a new unpaid invoice entry) */
  async addCharge(id: number, amount: number, note: string): Promise<any> {
    const c = await this.findOne(id);
    const count = await this.invoicesRepo.count();
    const inv = this.invoicesRepo.create({
      invoiceNumber: `CHG-${Date.now()}`,
      customerName: c.name,
      customerPhone: c.phone || '',
      total: amount,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      paymentMethod: 'debt',
      notes: note || 'إضافة دين',
      discount: 0,
      tax: 0,
    });
    return this.invoicesRepo.save(inv);
  }
}
