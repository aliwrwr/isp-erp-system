import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoiceNumber: string;

  @ManyToOne(() => User, user => user.invoices)
  customer: User;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column('decimal', { precision: 8, scale: 2 })
  total: number;

  @Column('decimal', { precision: 8, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 8, scale: 2, default: 0 })
  tax: number;

  @Column()
  paymentMethod: string;

  @CreateDateColumn()
  date: Date;
}
