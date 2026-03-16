import { IsNotEmpty, IsObject, IsDate, IsNumber, IsString } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Package } from '../../packages/entities/package.entity';

export class CreateSubscriptionDto {
  @IsObject()
  @IsNotEmpty()
  subscriber: Subscriber;

  @IsObject()
  @IsNotEmpty()
  package: Package;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
