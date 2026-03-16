import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscriber, subscriber => subscriber.subscriptions)
  subscriber: Subscriber;

  @ManyToOne(() => Package, pkg => pkg.subscriptions)
  package: Package;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column()
  paymentMethod: string;

  @Column()
  status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  debtAmount: number;

  @Column({ type: 'text', nullable: true, default: '' })
  notes: string;
}
