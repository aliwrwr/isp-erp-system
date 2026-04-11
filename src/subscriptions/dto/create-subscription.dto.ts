import { IsNotEmpty, IsObject, IsDate, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

export class CreateSubscriptionDto {
  @IsObject()
  @IsNotEmpty()
  subscriber: Subscriber;

  @IsObject()
  @IsOptional()
  package?: Package;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
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
