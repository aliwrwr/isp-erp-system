import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, invoice => invoice.items)
  invoice: Invoice;

  @ManyToOne(() => Product, product => product.invoiceItems, { nullable: true })
  product: Product;

  @Column({ nullable: true })
  name: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;
}
