import { IsNotEmpty, IsObject, IsDate, IsNumber, IsString, IsOptional } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

export class CreateSubscriptionDto {
  @IsObject()
  @IsNotEmpty()
  subscriber: Subscriber;

  @IsObject()
  @IsOptional()
  package?: Package;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @IsNumber()
  @IsOptional()
  debtAmount?: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
