import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  downloadSpeed?: number;

  @IsNumber()
  @IsOptional()
  uploadSpeed?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  duration?: number; // in days

  @IsNumber()
  @IsOptional()
  dataLimit?: number; // in GB

  @IsString()
  @IsOptional()
  routerProfile?: string;
}
