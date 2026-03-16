import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateWhatsappSettingsDto {
  @IsBoolean()
  @IsOptional()
  activationEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  expiryWarningEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  expiryEnabled?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  warningDays?: number;

  @IsString()
  @IsOptional()
  activationTemplate?: string;

  @IsString()
  @IsOptional()
  expiryWarningTemplate?: string;

  @IsString()
  @IsOptional()
  expiryTemplate?: string;
}
