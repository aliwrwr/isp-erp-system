import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Manager } from '../../managers/entities/manager.entity';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  secondaryPhone: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  macAddress: string;

  @Column({ nullable: true })
  cabinetSector: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => Manager, { nullable: true, eager: false })
  manager: Manager;

  @ManyToOne(() => Package, pkg => pkg.subscribers)
  package: Package;

  @OneToMany(() => Subscription, subscription => subscription.subscriber)
  subscriptions: Subscription[];

  @Column({ default: 'active' })
  status: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
