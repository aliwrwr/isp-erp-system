import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, employee => employee.attendances)
  employee: Employee;

  @Column()
  checkIn: Date;

  @Column({ nullable: true })
  checkOut: Date;
}
