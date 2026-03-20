import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateSubscriberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  cabinetSector?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsOptional()
  packageId?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  subStartDate?: string;

  @IsString()
  @IsOptional()
  subEndDate?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsNumber()
  @IsOptional()
  partialAmount?: number;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
