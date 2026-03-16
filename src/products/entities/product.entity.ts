import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { InvoiceItem } from '../../invoices/entities/invoice-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  barcode: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @Column({ nullable: true })
  supplier: string;

  @Column({ default: 0 })
  stock: number;

  @OneToMany(() => InvoiceItem, item => item.product)
  invoiceItems: InvoiceItem[];
}
