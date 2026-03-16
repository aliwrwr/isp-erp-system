import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Employee } from '../../employees/entities/employee.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsObject()
  @IsOptional()
  subscriber?: Subscriber;

  @IsObject()
  @IsOptional()
  assignedTo?: Employee;

  @IsString()
  @IsOptional()
  notes?: string;
}
