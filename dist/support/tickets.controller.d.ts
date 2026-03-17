import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto): Promise<import("./entities/ticket.entity").Ticket>;
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }>;
    findAll(status?: string, priority?: string): Promise<import("./entities/ticket.entity").Ticket[]>;
    findOne(id: number): Promise<import("./entities/ticket.entity").Ticket>;
    update(id: number, updateTicketDto: UpdateTicketDto): Promise<import("./entities/ticket.entity").Ticket>;
    remove(id: number): Promise<void>;
}
