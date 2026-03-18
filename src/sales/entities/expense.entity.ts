import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sales_expenses_legacy')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'general' })
  category: string; // general, rent, utilities, salary, maintenance

  @Column({ nullable: true })
  reference: string;

  @CreateDateColumn()
  date: Date;
}
