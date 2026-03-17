import { TicketPriority, TicketStatus, TicketType } from '../entities/ticket.entity';
export declare class UpdateTicketDto {
    subject?: string;
    description?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    type?: TicketType;
    subscriberId?: number;
    assignedToId?: number;
    notes?: string;
}
