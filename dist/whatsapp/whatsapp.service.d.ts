import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WhatsappSettings } from './entities/whatsapp-settings.entity';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { UpdateWhatsappSettingsDto } from './dto/update-settings.dto';
export declare class WhatsappService implements OnModuleInit, OnModuleDestroy {
    private settingsRepository;
    private logRepository;
    private readonly logger;
    private client;
    private qrDataUrl;
    private isConnected;
    private phoneNumber;
    private isInitializing;
    constructor(settingsRepository: Repository<WhatsappSettings>, logRepository: Repository<WhatsappLog>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    initializeClient(): Promise<void>;
    disconnect(): Promise<void>;
    formatPhone(phone: string): string;
    sendMessage(phone: string, message: string, type?: string, subscriberName?: string): Promise<boolean>;
    private saveLog;
    renderTemplate(template: string, vars: Record<string, string | number>): string;
    sendActivationNotification(subscriberPhone: string, subscriberName: string, packageName: string, endDate: Date | null): Promise<void>;
    sendExpiryWarningNotification(subscriberPhone: string, subscriberName: string, packageName: string, endDate: Date | null, daysLeft: number): Promise<void>;
    sendExpiryNotification(subscriberPhone: string, subscriberName: string, packageName: string, endDate: Date | null): Promise<void>;
    getLogs(page?: number, limit?: number): Promise<{
        data: WhatsappLog[];
        total: number;
    }>;
    getSettings(): Promise<WhatsappSettings>;
    updateSettings(dto: UpdateWhatsappSettingsDto): Promise<WhatsappSettings>;
    getStatus(): {
        connected: boolean;
        initializing: boolean;
        phone: string | null;
        hasQR: boolean;
        qr: string | null;
    };
}
