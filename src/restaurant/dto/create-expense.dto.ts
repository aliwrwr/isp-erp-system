import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString() title: string;
  @IsNumber() amount: number;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() date?: string;
}
