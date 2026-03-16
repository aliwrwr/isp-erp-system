import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export class CreatePaymentDto {
  @IsObject()
  @IsOptional()
  subscriber?: Subscriber;

  @IsObject()
  @IsOptional()
  subscription?: Subscription;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
