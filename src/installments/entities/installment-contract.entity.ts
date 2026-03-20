import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { InstallmentCustomer } from './installment-customer.entity';
import { InstallmentPayment } from './installment-payment.entity';

@Entity('installment_contracts')
export class InstallmentContract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  contractNumber: string;

  @ManyToOne(() => InstallmentCustomer, c => c.contracts, { eager: true })
  @JoinColumn()
  customer: InstallmentCustomer;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  downPayment: number;

  @Column('decimal', { precision: 10, scale: 2 })
  remainingAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ default: 1 })
  installmentCount: number;

  @Column({ nullable: true })
  paidCount: number;

  @Column()
  startDate: string;

  @Column({ nullable: true })
  nextDueDate: string;

  @Column({ default: 'monthly' })
  frequency: string; // monthly, weekly, daily

  @Column({ default: 'active' })
  status: string; // active, completed, late, cancelled

  @Column({ nullable: true })
  guarantorName: string;

  @Column({ nullable: true })
  guarantorPhone: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => InstallmentPayment, p => p.contract, { eager: true })
  payments: InstallmentPayment[];
}
