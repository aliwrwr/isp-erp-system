import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  downloadSpeed: number;

  @Column()
  uploadSpeed: number;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column()
  duration: number; // in days

  @Column({ nullable: true })
  dataLimit: number; // in GB

  @Column({ nullable: true })
  routerProfile: string;

  @OneToMany(() => Subscriber, subscriber => subscriber.package)
  subscribers: Subscriber[];

  @OneToMany(() => Subscription, subscription => subscription.package)
  subscriptions: Subscription[];
}
