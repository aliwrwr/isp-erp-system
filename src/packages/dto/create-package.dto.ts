import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  downloadSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  uploadSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  duration: number; // in days

  @IsNumber()
  @IsOptional()
  dataLimit?: number; // in GB

  @IsString()
  @IsOptional()
  routerProfile?: string;
}
