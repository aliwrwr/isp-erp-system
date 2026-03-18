import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipientName: string;         // اسم المستلم

  @Column({ nullable: true })
  description: string;           // الوصف

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;                // المبلغ

  @Column({ default: 'general' })
  category: string;              // التصنيف

  @Column({ type: 'date' })
  date: string;                  // التاريخ

  @Column({ nullable: true })
  time: string;                  // الوقت HH:mm

  @CreateDateColumn()
  createdAt: Date;
}
