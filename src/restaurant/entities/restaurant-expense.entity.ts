import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('restaurant_expenses')
export class RestaurantExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'general' })
  category: string; // ingredients, maintenance, salaries, utilities, general

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
