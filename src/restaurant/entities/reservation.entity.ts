import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { RestaurantTable } from './restaurant-table.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ default: 2 })
  guests: number;

  @ManyToOne(() => RestaurantTable, { eager: true, nullable: true })
  table: RestaurantTable;

  @Column({ default: 'confirmed' })
  status: string; // confirmed, cancelled, completed, no-show

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
