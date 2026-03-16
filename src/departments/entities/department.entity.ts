import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  manager: string;

  @Column('simple-json', { nullable: true })
  permissions: string[];

  @OneToMany(() => Employee, employee => employee.department)
  employees: Employee[];
}
