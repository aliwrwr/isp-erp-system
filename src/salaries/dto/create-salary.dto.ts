import { IsNotEmpty, IsObject, IsNumber, IsDate } from 'class-validator';
import { Employee } from '../../employees/entities/employee.entity';

export class CreateSalaryDto {
  @IsObject()
  @IsNotEmpty()
  employee: Employee;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @IsNotEmpty()
  date: Date;
}
