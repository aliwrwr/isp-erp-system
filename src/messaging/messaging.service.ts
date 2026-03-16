import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(MessageTemplate)
    private templatesRepository: Repository<MessageTemplate>,
  ) {}

  // Messages
  createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  findAllMessages(): Promise<Message[]> {
    return this.messagesRepository.find({ order: { sentAt: 'DESC' } });
  }

  findOneMessage(id: number): Promise<Message | null> {
    return this.messagesRepository.findOne({ where: { id } });
  }

  async removeMessage(id: number): Promise<void> {
    await this.messagesRepository.delete(id);
  }

  // Templates
  createTemplate(createTemplateDto: CreateTemplateDto): Promise<MessageTemplate> {
    const template = this.templatesRepository.create(createTemplateDto);
    return this.templatesRepository.save(template);
  }

  findAllTemplates(): Promise<MessageTemplate[]> {
    return this.templatesRepository.find();
  }

  findOneTemplate(id: number): Promise<MessageTemplate | null> {
    return this.templatesRepository.findOne({ where: { id } });
  }

  async updateTemplate(id: number, updateTemplateDto: UpdateTemplateDto): Promise<MessageTemplate | null> {
    await this.templatesRepository.update(id, updateTemplateDto);
    return this.findOneTemplate(id);
  }

  async removeTemplate(id: number): Promise<void> {
    await this.templatesRepository.delete(id);
  }
}
