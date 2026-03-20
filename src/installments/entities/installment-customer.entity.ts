import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { InstallmentContract } from './installment-contract.entity';

@Entity('installment_customers')
export class InstallmentCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  phone2: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'active' })
  status: string; // active, blocked

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => InstallmentContract, c => c.customer)
  contracts: InstallmentContract[];
}
