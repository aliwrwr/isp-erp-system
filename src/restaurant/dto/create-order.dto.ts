import { IsString, IsNumber, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsObject() @IsOptional() table?: any;
  @IsNumber() @IsOptional() tableId?: number;
  @IsArray() items: any[];
  @IsString() @IsOptional() customerName?: string;
  @IsString() @IsOptional() waiter?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() orderType?: string;
  @IsNumber() @IsOptional() totalAmount?: number;
}
