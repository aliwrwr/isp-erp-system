import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { TicketPriority, TicketStatus, TicketType } from '../entities/ticket.entity';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(Object.values(TicketPriority))
  @IsOptional()
  priority?: TicketPriority;

  @IsIn(Object.values(TicketStatus))
  @IsOptional()
  status?: TicketStatus;

  @IsIn(Object.values(TicketType))
  @IsOptional()
  type?: TicketType;

  @IsNumber()
  @IsOptional()
  subscriberId?: number;

  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
