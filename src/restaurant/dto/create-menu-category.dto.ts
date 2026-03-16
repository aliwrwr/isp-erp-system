import { IsString, IsOptional } from 'class-validator';

export class CreateMenuCategoryDto {
  @IsString() name: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() icon?: string;
  @IsString() @IsOptional() image?: string;
}
