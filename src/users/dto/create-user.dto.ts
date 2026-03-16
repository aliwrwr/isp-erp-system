import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password;

  @IsArray()
  @IsOptional()
  roles: string[];
}
