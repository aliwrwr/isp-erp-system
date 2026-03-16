import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
