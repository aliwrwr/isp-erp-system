import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { InstallmentContract } from './installment-contract.entity';

@Entity('installment_payments')
export class InstallmentPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InstallmentContract, c => c.payments)
  @JoinColumn()
  contract: InstallmentContract;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  date: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'paid' })
  status: string; // paid, partial, late

  @Column({ nullable: true })
  receivedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
