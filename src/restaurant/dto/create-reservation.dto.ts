import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateReservationDto {
  @IsString() customerName: string;
  @IsString() @IsOptional() customerPhone?: string;
  @IsString() date: string;
  @IsString() time: string;
  @IsNumber() @IsOptional() guests?: number;
  @IsObject() @IsOptional() table?: any;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() notes?: string;
}
