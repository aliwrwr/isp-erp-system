import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

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
