import { IsOptional, IsObject, IsDate } from 'class-validator';
import { Employee } from '../../employees/entities/employee.entity';

export class UpdateAttendanceDto {
  @IsObject()
  @IsOptional()
  employee?: Employee;

  @IsDate()
  @IsOptional()
  checkIn?: Date;

  @IsDate()
  @IsOptional()
  checkOut?: Date;
}
