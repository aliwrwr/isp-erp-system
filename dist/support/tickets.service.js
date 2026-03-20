"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("./entities/ticket.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let TicketsService = class TicketsService {
    ticketsRepository;
    whatsappService;
    constructor(ticketsRepository, whatsappService) {
        this.ticketsRepository = ticketsRepository;
        this.whatsappService = whatsappService;
    }
    async create(createTicketDto) {
        const ticket = this.ticketsRepository.create(createTicketDto);
        const saved = await this.ticketsRepository.save(ticket);
        if (createTicketDto.subscriberId) {
            try {
                const withRelations = await this.findOne(saved.id);
                const phone = withRelations.subscriber?.phone;
                const name = withRelations.subscriber?.name ?? '';
                if (phone) {
                    this.whatsappService.sendTicketCreatedNotification(phone, name, saved.id, createTicketDto.description);
                }
            }
            catch (_) { }
        }
        return saved;
    }
    findAll(status, priority) {
        const query = this.ticketsRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.subscriber', 'subscriber')
            .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
            .orderBy('ticket.createdAt', 'DESC');
        if (status)
            query.andWhere('ticket.status = :status', { status });
        if (priority)
            query.andWhere('ticket.priority = :priority', { priority });
        return query.getMany();
    }
    async findOne(id) {
        const ticket = await this.ticketsRepository.findOne({
            where: { id },
            relations: ['subscriber', 'assignedTo'],
        });
        if (!ticket)
            throw new common_1.NotFoundException(`التذكرة رقم ${id} غير موجودة`);
        return ticket;
    }
    async update(id, updateTicketDto) {
        const ticket = await this.findOne(id);
        const wasResolved = ticket.status === ticket_entity_1.TicketStatus.RESOLVED;
        const oldAssignedToId = ticket.assignedToId;
        const subscriberPhone = ticket.subscriber?.phone;
        const subscriberName = ticket.subscriber?.name ?? '';
        if (updateTicketDto.status === ticket_entity_1.TicketStatus.RESOLVED &&
            ticket.status !== ticket_entity_1.TicketStatus.RESOLVED) {
            Object.assign(ticket, updateTicketDto);
            ticket.resolvedAt = new Date();
        }
        else {
            Object.assign(ticket, updateTicketDto);
        }
        const saved = await this.ticketsRepository.save(ticket);
        if (!wasResolved && saved.status === ticket_entity_1.TicketStatus.RESOLVED && subscriberPhone) {
            this.whatsappService.sendTicketResolvedNotification(subscriberPhone, subscriberName, saved.id);
        }
        if (updateTicketDto.assignedToId &&
            updateTicketDto.assignedToId !== oldAssignedToId &&
            subscriberPhone) {
            try {
                const reloaded = await this.findOne(saved.id);
                const techName = reloaded.assignedTo?.name ?? '';
                this.whatsappService.sendTechAssignedNotification(subscriberPhone, subscriberName, saved.id, techName);
            }
            catch (_) { }
        }
        return saved;
    }
    async remove(id) {
        const ticket = await this.findOne(id);
        await this.ticketsRepository.remove(ticket);
    }
    async getStats() {
        const [total, open, inProgress, resolved, closed] = await Promise.all([
            this.ticketsRepository.count(),
            this.ticketsRepository.count({ where: { status: ticket_entity_1.TicketStatus.OPEN } }),
            this.ticketsRepository.count({ where: { status: ticket_entity_1.TicketStatus.IN_PROGRESS } }),
            this.ticketsRepository.count({ where: { status: ticket_entity_1.TicketStatus.RESOLVED } }),
            this.ticketsRepository.count({ where: { status: ticket_entity_1.TicketStatus.CLOSED } }),
        ]);
        return { total, open, inProgress, resolved, closed };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map