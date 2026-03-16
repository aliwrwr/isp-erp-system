import { IsString, IsOptional, IsObject } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Employee } from '../../employees/entities/employee.entity';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  status?: string;

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
