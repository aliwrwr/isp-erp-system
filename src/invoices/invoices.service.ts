import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const items = await Promise.all(createInvoiceDto.items.map(async (itemDto) => {
      const product = await this.productsRepository.findOneBy({ id: itemDto.productId });
      if (!product) {
        throw new Error(`Product with ID ${itemDto.productId} not found`);
      }
      const item = new InvoiceItem();
      item.product = product;
      item.quantity = itemDto.quantity;
      item.price = itemDto.price;
      // Update stock
      product.stock -= item.quantity;
      await this.productsRepository.save(product);
      return item;
    }));

    const { items: _, ...rest } = createInvoiceDto as any;
    const invoice = this.invoicesRepository.create({
      ...rest,
      invoiceNumber: `INV-${Date.now()}`,
      items,
      paymentStatus: createInvoiceDto.paymentStatus || 'paid',
      paidAmount: createInvoiceDto.paidAmount ?? createInvoiceDto.total,
    });

    const saved = await this.invoicesRepository.save(invoice);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  findAll(): Promise<Invoice[]> {
    return this.invoicesRepository.find({ relations: ['customer', 'items', 'items.product'] });
  }

  findOne(id: number): Promise<Invoice | null> {
    return this.invoicesRepository.findOne({ where: { id }, relations: ['customer', 'items', 'items.product'] });
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice | null> {
    // This is a simplified update. A real-world scenario would need to handle item changes, stock adjustments, etc.
    await this.invoicesRepository.update(id, updateInvoiceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // This is a simplified remove. A real-world scenario would need to handle stock adjustments.
    await this.invoicesRepository.delete(id);
  }
}
