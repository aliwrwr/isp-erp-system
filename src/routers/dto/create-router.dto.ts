import { IsString, IsNotEmpty, IsIP, IsNumber, IsOptional } from 'class-validator';

export class CreateRouterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIP()
  @IsNotEmpty()
  ipAddress: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  connectionType?: string;
}
