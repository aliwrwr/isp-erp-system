import { IsNotEmpty, IsObject, IsDate, IsOptional } from 'class-validator';
import { Employee } from '../../employees/entities/employee.entity';

export class CreateAttendanceDto {
  @IsObject()
  @IsNotEmpty()
  employee: Employee;

  @IsDate()
  @IsNotEmpty()
  checkIn: Date;

  @IsDate()
  @IsOptional()
  checkOut?: Date;
}
