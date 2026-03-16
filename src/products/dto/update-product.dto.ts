import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsObject()
  @IsOptional()
  category?: Category;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;
}
