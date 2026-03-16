import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscriber, { nullable: true })
  subscriber: Subscriber;

  @ManyToOne(() => Subscription, { nullable: true })
  subscription: Subscription;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'cash' })
  method: string; // cash, bank_transfer, online

  @Column({ default: 'paid' })
  status: string; // paid, pending, cancelled

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  date: Date;
}
