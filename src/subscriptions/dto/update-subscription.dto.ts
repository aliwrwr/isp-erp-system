import { IsOptional, IsObject, IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

export class UpdateSubscriptionDto {
  @IsObject()
  @IsOptional()
  subscriber?: Subscriber;

  @IsObject()
  @IsOptional()
  package?: Package;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
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
