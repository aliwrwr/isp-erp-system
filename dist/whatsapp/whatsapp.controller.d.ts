import { WhatsappService } from './whatsapp.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { UpdateWhatsappSettingsDto } from './dto/update-settings.dto';
import { UpdateInstallmentsSettingsDto } from './dto/update-installments-settings.dto';
import { UpdateSupportSettingsDto } from './dto/update-support-settings.dto';
import { SendTestMessageDto } from './dto/send-test.dto';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly scheduler;
    constructor(whatsappService: WhatsappService, scheduler: NotificationSchedulerService);
    getStatus(): {
        connected: boolean;
        initializing: boolean;
        phone: string | null;
        hasQR: boolean;
        qr: string | null;
    };
    connect(): Promise<{
        message: string;
    }>;
    disconnect(): Promise<{
        message: string;
    }>;
    changeDevice(): Promise<{
        message: string;
    }>;
    sendTest(dto: SendTestMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getSettings(): Promise<import("./entities/whatsapp-settings.entity").WhatsappSettings>;
    updateSettings(dto: UpdateWhatsappSettingsDto): Promise<import("./entities/whatsapp-settings.entity").WhatsappSettings>;
    getExpiring(days?: string): Promise<any[]>;
    sendNow(): Promise<{
        sent: number;
        failed: number;
    }>;
    sendDirect(dto: SendTestMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getLogs(page?: string, limit?: string): Promise<{
        data: import("./entities/whatsapp-log.entity").WhatsappLog[];
        total: number;
    }>;
    getInstallmentsSettings(): Promise<import("./entities/whatsapp-installments-settings.entity").WhatsappInstallmentsSettings>;
    updateInstallmentsSettings(dto: UpdateInstallmentsSettingsDto): Promise<import("./entities/whatsapp-installments-settings.entity").WhatsappInstallmentsSettings>;
    getSupportSettings(): Promise<import("./entities/whatsapp-support-settings.entity").WhatsappSupportSettings>;
    updateSupportSettings(dto: UpdateSupportSettingsDto): Promise<import("./entities/whatsapp-support-settings.entity").WhatsappSupportSettings>;
}
