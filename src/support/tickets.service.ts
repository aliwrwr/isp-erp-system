import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create(createTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({ relations: ['subscriber', 'assignedTo'] });
  }

  findOne(id: number): Promise<Ticket | null> {
    return this.ticketsRepository.findOne({ where: { id }, relations: ['subscriber', 'assignedTo'] });
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket | null> {
    await this.ticketsRepository.update(id, updateTicketDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ticketsRepository.delete(id);
  }
}
