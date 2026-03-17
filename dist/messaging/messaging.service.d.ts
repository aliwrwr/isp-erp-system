import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
export declare class MessagingService {
    private messagesRepository;
    private templatesRepository;
    constructor(messagesRepository: Repository<Message>, templatesRepository: Repository<MessageTemplate>);
    createMessage(createMessageDto: CreateMessageDto): Promise<Message>;
    findAllMessages(): Promise<Message[]>;
    findOneMessage(id: number): Promise<Message | null>;
    removeMessage(id: number): Promise<void>;
    createTemplate(createTemplateDto: CreateTemplateDto): Promise<MessageTemplate>;
    findAllTemplates(): Promise<MessageTemplate[]>;
    findOneTemplate(id: number): Promise<MessageTemplate | null>;
    updateTemplate(id: number, updateTemplateDto: UpdateTemplateDto): Promise<MessageTemplate | null>;
    removeTemplate(id: number): Promise<void>;
}
