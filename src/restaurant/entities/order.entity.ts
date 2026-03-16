import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { RestaurantTable } from './restaurant-table.entity';
import { OrderItem } from './order-item.entity';

@Entity('restaurant_orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => RestaurantTable, { eager: true, nullable: true })
  table: RestaurantTable;

  @OneToMany(() => OrderItem, item => item.order, { eager: true, cascade: true })
  items: OrderItem[];

  @Column({ default: 'pending' })
  status: string; // pending, preparing, ready, served, paid, cancelled

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  waiter: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: 'dine-in' })
  orderType: string; // dine-in, takeaway, delivery

  @CreateDateColumn()
  createdAt: Date;
}
