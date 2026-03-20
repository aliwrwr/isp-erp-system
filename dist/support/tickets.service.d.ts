import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class TicketsService {
    private ticketsRepository;
    private readonly whatsappService;
    constructor(ticketsRepository: Repository<Ticket>, whatsappService: WhatsappService);
    create(createTicketDto: CreateTicketDto): Promise<Ticket>;
    findAll(status?: string, priority?: string): Promise<Ticket[]>;
    findOne(id: number): Promise<Ticket>;
    update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket>;
    remove(id: number): Promise<void>;
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }>;
}
