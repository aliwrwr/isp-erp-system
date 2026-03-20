import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create(createTicketDto);
    const saved = await this.ticketsRepository.save(ticket);

    // Send WhatsApp notification if subscriber has a phone
    if (createTicketDto.subscriberId) {
      try {
        const withRelations = await this.findOne(saved.id);
        const phone = withRelations.subscriber?.phone;
        const name = withRelations.subscriber?.name ?? '';
        if (phone) {
          this.whatsappService.sendTicketCreatedNotification(
            phone, name, saved.id, createTicketDto.description,
          );
        }
      } catch (_) {}
    }

    return saved;
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

    const wasResolved = ticket.status === TicketStatus.RESOLVED;
    const oldAssignedToId = ticket.assignedToId;
    const subscriberPhone = ticket.subscriber?.phone;
    const subscriberName = ticket.subscriber?.name ?? '';

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
    const saved = await this.ticketsRepository.save(ticket);

    // Send ticket resolved notification
    if (!wasResolved && saved.status === TicketStatus.RESOLVED && subscriberPhone) {
      this.whatsappService.sendTicketResolvedNotification(subscriberPhone, subscriberName, saved.id);
    }

    // Send tech assigned notification (new or changed assignment)
    if (
      updateTicketDto.assignedToId &&
      updateTicketDto.assignedToId !== oldAssignedToId &&
      subscriberPhone
    ) {
      try {
        const reloaded = await this.findOne(saved.id);
        const techName = reloaded.assignedTo?.name ?? '';
        this.whatsappService.sendTechAssignedNotification(subscriberPhone, subscriberName, saved.id, techName);
      } catch (_) {}
    }

    return saved;
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
