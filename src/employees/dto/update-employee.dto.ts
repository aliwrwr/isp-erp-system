import { IsString, IsOptional, IsObject, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Department } from '../../departments/entities/department.entity';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsObject()
  @IsOptional()
  department?: Department;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  hireDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;
}
