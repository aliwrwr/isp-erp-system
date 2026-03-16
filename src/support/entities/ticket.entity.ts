import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketType {
  INTERNET = 'internet',
  HARDWARE = 'hardware',
  BILLING = 'billing',
  ACCOUNT = 'account',
  OTHER = 'other',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column({ type: 'varchar', default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'varchar', default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'varchar', default: TicketType.OTHER })
  type: TicketType;

  @Column({ nullable: true })
  subscriberId: number;

  @ManyToOne(() => Subscriber, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscriberId' })
  subscriber: Subscriber;

  @Column({ nullable: true })
  assignedToId: number;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Employee;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  resolvedAt: Date;

  @Column('text', { nullable: true })
  notes: string;
}
