import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export class UpdatePaymentDto {
  @IsObject()
  @IsOptional()
  subscriber?: Subscriber;

  @IsObject()
  @IsOptional()
  subscription?: Subscription;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
