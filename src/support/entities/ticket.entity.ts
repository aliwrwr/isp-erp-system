import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column({ default: 'medium' })
  priority: string; // low, medium, high, critical

  @Column({ default: 'open' })
  status: string; // open, in-progress, resolved, closed

  @ManyToOne(() => Subscriber, { nullable: true })
  subscriber: Subscriber;

  @ManyToOne(() => Employee, { nullable: true })
  assignedTo: Employee;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('text', { nullable: true })
  notes: string;
}
