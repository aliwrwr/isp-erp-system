import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Product } from '../../products/entities/product.entity';

export class CreateInventoryMovementDto {
  @IsObject()
  @IsNotEmpty()
  product: Product;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
