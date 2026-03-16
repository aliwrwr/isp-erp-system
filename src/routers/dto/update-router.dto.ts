import { IsString, IsIP, IsNumber, IsOptional } from 'class-validator';

export class UpdateRouterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsIP()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsOptional()
  port?: number;
}
