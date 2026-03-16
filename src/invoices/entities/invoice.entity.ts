import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoiceNumber: string;

  @ManyToOne(() => User, user => user.invoices, { nullable: true })
  customer: User;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerAddress: string;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ default: 'cash' })
  paymentMethod: string;

  @Column({ default: 'paid' })
  paymentStatus: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  date: Date;
}
