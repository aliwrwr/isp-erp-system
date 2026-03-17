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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const message_template_entity_1 = require("./entities/message-template.entity");
let MessagingService = class MessagingService {
    messagesRepository;
    templatesRepository;
    constructor(messagesRepository, templatesRepository) {
        this.messagesRepository = messagesRepository;
        this.templatesRepository = templatesRepository;
    }
    createMessage(createMessageDto) {
        const message = this.messagesRepository.create(createMessageDto);
        return this.messagesRepository.save(message);
    }
    findAllMessages() {
        return this.messagesRepository.find({ order: { sentAt: 'DESC' } });
    }
    findOneMessage(id) {
        return this.messagesRepository.findOne({ where: { id } });
    }
    async removeMessage(id) {
        await this.messagesRepository.delete(id);
    }
    createTemplate(createTemplateDto) {
        const template = this.templatesRepository.create(createTemplateDto);
        return this.templatesRepository.save(template);
    }
    findAllTemplates() {
        return this.templatesRepository.find();
    }
    findOneTemplate(id) {
        return this.templatesRepository.findOne({ where: { id } });
    }
    async updateTemplate(id, updateTemplateDto) {
        await this.templatesRepository.update(id, updateTemplateDto);
        return this.findOneTemplate(id);
    }
    async removeTemplate(id) {
        await this.templatesRepository.delete(id);
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(message_template_entity_1.MessageTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map