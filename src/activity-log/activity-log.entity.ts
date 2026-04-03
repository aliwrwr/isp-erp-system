import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ nullable: true })
  module: string;

  @Column('text', { nullable: true })
  details: string;

  @Column({ nullable: true })
  subscriberName: string;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  userId: number;
}
