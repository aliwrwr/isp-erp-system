import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cashbox_manual')
export class CashboxManual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'in' | 'out'

  @Column({ type: 'real' })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  time: string;

  @CreateDateColumn()
  createdAt: Date;
}
