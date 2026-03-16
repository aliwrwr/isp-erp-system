import { IsNotEmpty, IsString } from 'class-validator';

export class SendTestMessageDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
