import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  layout?: string;

  @IsOptional()
  @IsString()
  permissions?: string;

  @IsOptional()
  @IsNumber()
  dashboardId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
