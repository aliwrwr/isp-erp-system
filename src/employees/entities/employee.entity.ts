import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Salary } from '../../salaries/entities/salary.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @ManyToOne(() => Department, department => department.employees)
  department: Department;

  @Column()
  position: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salary: number;

  @Column()
  hireDate: Date;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Attendance, attendance => attendance.employee)
  attendances: Attendance[];

  @OneToMany(() => Salary, salary => salary.employee)
  salaries: Salary[];
}
