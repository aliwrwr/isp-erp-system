import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Department } from '../../departments/entities/department.entity';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @IsNotEmpty()
  department: Department;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsNumber()
  @IsNotEmpty()
  salary: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  hireDate: Date;

  @IsString()
  @IsOptional()
  status?: string;
}
