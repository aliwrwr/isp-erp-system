import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

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
