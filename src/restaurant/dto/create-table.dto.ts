import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTableDto {
  @IsNumber() number: number;
  @IsNumber() @IsOptional() capacity?: number;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() section?: string;
}
