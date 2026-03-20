import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInstallmentsSettingsDto {
  @IsOptional() @IsBoolean() paymentDueEnabled?: boolean;
  @IsOptional() @IsNumber() @Min(1) warningDays?: number;
  @IsOptional() @IsString() paymentDueTemplate?: string;

  @IsOptional() @IsBoolean() overdueEnabled?: boolean;
  @IsOptional() @IsString() overdueTemplate?: string;

  @IsOptional() @IsBoolean() paymentReceivedEnabled?: boolean;
  @IsOptional() @IsString() paymentReceivedTemplate?: string;
}
