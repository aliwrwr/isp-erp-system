import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
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

  findAll(status?: string, priority?: string): Promise<Ticket[]> {
    const query = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.subscriber', 'subscriber')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .orderBy('ticket.createdAt', 'DESC');

    if (status) query.andWhere('ticket.status = :status', { status });
    if (priority) query.andWhere('ticket.priority = :priority', { priority });

    return query.getMany();
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['subscriber', 'assignedTo'],
    });
    if (!ticket) throw new NotFoundException(`التذكرة رقم ${id} غير موجودة`);
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // Set resolvedAt when status changes to resolved
    if (
      updateTicketDto.status === TicketStatus.RESOLVED &&
      ticket.status !== TicketStatus.RESOLVED
    ) {
      Object.assign(ticket, updateTicketDto);
      ticket.resolvedAt = new Date();
    } else {
      Object.assign(ticket, updateTicketDto);
    }
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }

  async getStats() {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.ticketsRepository.count(),
      this.ticketsRepository.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.RESOLVED } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.CLOSED } }),
    ]);

    return { total, open, inProgress, resolved, closed };
  }
}
