import { IsOptional, IsObject, IsDate, IsNumber, IsString } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

export class UpdateSubscriptionDto {
  @IsObject()
  @IsOptional()
  subscriber?: Subscriber;

  @IsObject()
  @IsOptional()
  package?: Package;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  paidAmount?: number;
}
