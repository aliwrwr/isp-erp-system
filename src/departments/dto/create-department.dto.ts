import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}
