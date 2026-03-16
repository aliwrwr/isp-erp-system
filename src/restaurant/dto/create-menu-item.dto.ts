import { IsString, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateMenuItemDto {
  @IsString() name: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() price: number;
  @IsNumber() @IsOptional() cost?: number;
  @IsObject() @IsOptional() category?: any;
  @IsBoolean() @IsOptional() available?: boolean;
  @IsNumber() @IsOptional() preparationTime?: number;
  @IsString() @IsOptional() image?: string;
}
