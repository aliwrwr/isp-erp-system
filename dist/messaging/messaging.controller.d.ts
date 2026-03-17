import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    createMessage(createMessageDto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    findAllMessages(): Promise<import("./entities/message.entity").Message[]>;
    findOneMessage(id: string): Promise<import("./entities/message.entity").Message | null>;
    removeMessage(id: string): Promise<void>;
    createTemplate(createTemplateDto: CreateTemplateDto): Promise<import("./entities/message-template.entity").MessageTemplate>;
    findAllTemplates(): Promise<import("./entities/message-template.entity").MessageTemplate[]>;
    findOneTemplate(id: string): Promise<import("./entities/message-template.entity").MessageTemplate | null>;
    updateTemplate(id: string, updateTemplateDto: UpdateTemplateDto): Promise<import("./entities/message-template.entity").MessageTemplate | null>;
    removeTemplate(id: string): Promise<void>;
}
