import { IsOptional, IsObject, IsNumber, IsDate } from 'class-validator';
import { Employee } from '../../employees/entities/employee.entity';

export class UpdateSalaryDto {
  @IsObject()
  @IsOptional()
  employee?: Employee;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDate()
  @IsOptional()
  date?: Date;
}
