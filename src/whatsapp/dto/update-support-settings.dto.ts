import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSupportSettingsDto {
  @IsOptional() @IsBoolean() ticketCreatedEnabled?: boolean;
  @IsOptional() @IsString() ticketCreatedTemplate?: string;

  @IsOptional() @IsBoolean() ticketResolvedEnabled?: boolean;
  @IsOptional() @IsString() ticketResolvedTemplate?: string;

  @IsOptional() @IsBoolean() techAssignedEnabled?: boolean;
  @IsOptional() @IsString() techAssignedTemplate?: string;
}
