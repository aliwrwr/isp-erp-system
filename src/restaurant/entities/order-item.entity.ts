import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';

@Entity('restaurant_order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => MenuItem, { eager: true })
  menuItem: MenuItem;

  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: 'pending' })
  status: string; // pending, preparing, ready, served
}
