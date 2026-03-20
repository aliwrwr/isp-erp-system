import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import { WhatsappSettings } from './entities/whatsapp-settings.entity';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { WhatsappInstallmentsSettings } from './entities/whatsapp-installments-settings.entity';
import { WhatsappSupportSettings } from './entities/whatsapp-support-settings.entity';
import { UpdateWhatsappSettingsDto } from './dto/update-settings.dto';
import { UpdateInstallmentsSettingsDto } from './dto/update-installments-settings.dto';
import { UpdateSupportSettingsDto } from './dto/update-support-settings.dto';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client | null = null;
  private qrDataUrl: string | null = null;
  private isConnected = false;
  private phoneNumber: string | null = null;
  private isInitializing = false;

  constructor(
    @InjectRepository(WhatsappSettings)
    private settingsRepository: Repository<WhatsappSettings>,
    @InjectRepository(WhatsappLog)
    private logRepository: Repository<WhatsappLog>,
    @InjectRepository(WhatsappInstallmentsSettings)
    private installmentsSettingsRepository: Repository<WhatsappInstallmentsSettings>,
    @InjectRepository(WhatsappSupportSettings)
    private supportSettingsRepository: Repository<WhatsappSupportSettings>,
  ) {}

  async onModuleInit() {
    // Initialize settings row if it doesn't exist
    const count = await this.settingsRepository.count();
    if (count === 0) {
      await this.settingsRepository.save(this.settingsRepository.create({}));
    }
    // Auto-connect if the user enabled this option
    const settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (settings?.autoConnect) {
      this.logger.log('Auto-connect enabled — initializing WhatsApp client...');
      // Delay slightly so the DB/ORM is fully ready
      setTimeout(() => this.initializeClient(), 3000);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (_) {
        // ignore
      }
    }
  }

  // ─── Client Lifecycle ────────────────────────────────────────────────────────

  async initializeClient(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;
    this.qrDataUrl = null;
    this.isConnected = false;
    this.phoneNumber = null;

    try {
      if (this.client) {
        await this.client.destroy().catch(() => {});
        this.client = null;
      }

      this.client = new Client({
        authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
        puppeteer: {
          headless: true,
          executablePath:
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--disable-blink-features=AutomationControlled',
          ],
          timeout: 60000,
        },
      });

      this.client.on('qr', async (qr: string) => {
        this.logger.log('WhatsApp QR code received — scan to connect');
        this.isConnected = false;
        try {
          this.qrDataUrl = await QRCode.toDataURL(qr, { scale: 6 });
        } catch (err) {
          this.logger.error('QR generation error', err);
        }
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.qrDataUrl = null;
        const info = (this.client as any)?.info;
        this.phoneNumber = info?.wid?.user ?? null;
        this.logger.log(
          `WhatsApp connected — phone: ${this.phoneNumber ?? 'unknown'}`,
        );
      });

      this.client.on('authenticated', () => {
        this.logger.log('WhatsApp authenticated');
      });

      this.client.on('auth_failure', (msg: any) => {
        this.logger.error(`WhatsApp auth failure: ${msg}`);
        this.isConnected = false;
      });

      this.client.on('disconnected', (reason: any) => {
        this.logger.warn(`WhatsApp disconnected: ${reason}`);
        this.isConnected = false;
        this.phoneNumber = null;
        this.qrDataUrl = null;
      });

      await this.client.initialize();
    } catch (err) {
      this.logger.error('WhatsApp client initialization failed', err);
      this.isConnected = false;
    } finally {
      this.isInitializing = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
      } catch (_) {
        // ignore
      }
      this.client = null;
    }
    this.isConnected = false;
    this.qrDataUrl = null;
    this.phoneNumber = null;
  }

  /**
   * Change WhatsApp device: wipe saved session files then re-init
   * so a fresh QR code is generated for a new phone.
   */
  async changeDevice(): Promise<void> {
    // Destroy existing client
    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
      } catch (_) {}
      this.client = null;
    }
    this.isConnected = false;
    this.qrDataUrl = null;
    this.phoneNumber = null;
    this.isInitializing = false;

    // Delete saved session folder so a new QR is generated
    const fs = await import('fs');
    const path = await import('path');
    const sessionPath = path.resolve('.wwebjs_auth');
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      this.logger.log('WhatsApp session data cleared for device change');
    }

    // Start fresh — user will scan a new QR
    await this.initializeClient();
  }

  // ─── Messaging ───────────────────────────────────────────────────────────────

  formatPhone(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    // Iraqi numbers: 07X → 9647X
    if (cleaned.startsWith('07')) {
      cleaned = '964' + cleaned.substring(1);
    }
    return cleaned + '@c.us';
  }

  async sendMessage(
    phone: string,
    message: string,
    type = 'manual',
    subscriberName = '',
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      this.logger.warn(`Cannot send message — WhatsApp not connected`);
      await this.saveLog(type, phone, subscriberName, message, false, 'WhatsApp غير متصل');
      return false;
    }
    try {
      const chatId = this.formatPhone(phone);
      await this.client.sendMessage(chatId, message);
      this.logger.log(`Message sent to ${phone}`);
      await this.saveLog(type, phone, subscriberName, message, true, null);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send message to ${phone}`, err);
      await this.saveLog(type, phone, subscriberName, message, false, String(err?.message ?? err));
      return false;
    }
  }

  private async saveLog(
    type: string,
    phone: string,
    subscriberName: string,
    message: string,
    success: boolean,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      const entry = this.logRepository.create({
        type,
        phone,
        subscriberName,
        message,
        success,
        errorMessage,
      });
      await this.logRepository.save(entry);
    } catch (_) {
      // Never let logging crash the caller
    }
  }

  renderTemplate(
    template: string,
    vars: Record<string, string | number>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replaceAll(`{{${key}}}`, String(value));
    }
    return result;
  }

  // ─── Notification Helpers ─────────────────────────────────────────────────────

  async sendActivationNotification(
    subscriberPhone: string,
    subscriberName: string,
    packageName: string,
    endDate: Date | null,
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.activationEnabled) {
        this.logger.debug(`Activation notification skipped (disabled) for ${subscriberPhone}`);
        return;
      }
      const message = this.renderTemplate(settings.activationTemplate, {
        name: subscriberName,
        phone: subscriberPhone,
        package: packageName,
        endDate: endDate
          ? new Date(endDate).toLocaleDateString('ar-IQ')
          : '—',
      });
      await this.sendMessage(subscriberPhone, message, 'activation', subscriberName);
    } catch (err) {
      this.logger.error('Failed to send activation notification', err);
    }
  }

  async sendExpiryWarningNotification(
    subscriberPhone: string,
    subscriberName: string,
    packageName: string,
    endDate: Date | null,
    daysLeft: number,
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.expiryWarningEnabled) return;
      const message = this.renderTemplate(settings.expiryWarningTemplate, {
        name: subscriberName,
        phone: subscriberPhone,
        package: packageName,
        endDate: endDate ? new Date(endDate).toLocaleDateString('ar-IQ') : '—',
        days: daysLeft,
      });
      await this.sendMessage(subscriberPhone, message, 'expiry_warning', subscriberName);
    } catch (err) {
      this.logger.error('Failed to send expiry warning notification', err);
    }
  }

  async sendExpiryNotification(
    subscriberPhone: string,
    subscriberName: string,
    packageName: string,
    endDate: Date | null,
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.expiryEnabled) return;
      const message = this.renderTemplate(settings.expiryTemplate, {
        name: subscriberName,
        phone: subscriberPhone,
        package: packageName,
        endDate: endDate ? new Date(endDate).toLocaleDateString('ar-IQ') : '—',
      });
      await this.sendMessage(subscriberPhone, message, 'expiry', subscriberName);
    } catch (err) {
      this.logger.error('Failed to send expiry notification', err);
    }
  }

  // ─── Settings ────────────────────────────────────────────────────────────────

  async getLogs(page = 1, limit = 10): Promise<{ data: WhatsappLog[]; total: number }> {
    const [data, total] = await this.logRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }

  async getStats(): Promise<{ total: number; success: number; failed: number }> {
    const [total, success] = await Promise.all([
      this.logRepository.count(),
      this.logRepository.count({ where: { success: true } }),
    ]);
    return { total, success, failed: total - success };
  }

  async getSettings(): Promise<WhatsappSettings> {
    let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = await this.settingsRepository.save(
        this.settingsRepository.create({}),
      );
    }
    return settings;
  }

  async updateSettings(
    dto: UpdateWhatsappSettingsDto,
  ): Promise<WhatsappSettings> {
    await this.settingsRepository.update(1, dto as any);
    return this.getSettings();
  }

  // ─── Status ──────────────────────────────────────────────────────────────────

  getStatus() {
    return {
      connected: this.isConnected,
      initializing: this.isInitializing,
      phone: this.phoneNumber,
      hasQR: !!this.qrDataUrl,
      qr: this.qrDataUrl,
    };
  }

  // ─── Installments Settings ────────────────────────────────────────────────────

  async getInstallmentsSettings(): Promise<WhatsappInstallmentsSettings> {
    let settings = await this.installmentsSettingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = await this.installmentsSettingsRepository.save(
        this.installmentsSettingsRepository.create({}),
      );
    }
    return settings;
  }

  async updateInstallmentsSettings(dto: UpdateInstallmentsSettingsDto): Promise<WhatsappInstallmentsSettings> {
    const existing = await this.getInstallmentsSettings();
    await this.installmentsSettingsRepository.update(existing.id, dto as any);
    return this.getInstallmentsSettings();
  }

  async sendInstallmentPaymentReceivedNotification(
    customerPhone: string,
    customerName: string,
    amount: number,
    contractNumber: string,
    installmentNo: number,
    remaining: number,
  ): Promise<void> {
    try {
      const settings = await this.getInstallmentsSettings();
      if (!settings.paymentReceivedEnabled) return;
      const message = this.renderTemplate(settings.paymentReceivedTemplate, {
        name: customerName,
        amount: amount.toLocaleString('ar-IQ'),
        contract: contractNumber,
        installmentNo: String(installmentNo),
        remaining: remaining.toLocaleString('ar-IQ'),
      });
      await this.sendMessage(customerPhone, message, 'installment_received', customerName);
    } catch (err) {
      this.logger.error('Failed to send installment payment received notification', err);
    }
  }

  // ─── Support Settings ─────────────────────────────────────────────────────────

  async getSupportSettings(): Promise<WhatsappSupportSettings> {
    let settings = await this.supportSettingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = await this.supportSettingsRepository.save(
        this.supportSettingsRepository.create({}),
      );
    }
    return settings;
  }

  async updateSupportSettings(dto: UpdateSupportSettingsDto): Promise<WhatsappSupportSettings> {
    const existing = await this.getSupportSettings();
    await this.supportSettingsRepository.update(existing.id, dto as any);
    return this.getSupportSettings();
  }

  async sendTicketCreatedNotification(
    customerPhone: string,
    customerName: string,
    ticketId: number | string,
    description: string,
  ): Promise<void> {
    try {
      const settings = await this.getSupportSettings();
      if (!settings.ticketCreatedEnabled) return;
      const message = this.renderTemplate(settings.ticketCreatedTemplate, {
        name: customerName,
        ticketId: String(ticketId),
        description,
      });
      await this.sendMessage(customerPhone, message, 'ticket_created', customerName);
    } catch (err) {
      this.logger.error('Failed to send ticket created notification', err);
    }
  }

  async sendTicketResolvedNotification(
    customerPhone: string,
    customerName: string,
    ticketId: number | string,
  ): Promise<void> {
    try {
      const settings = await this.getSupportSettings();
      if (!settings.ticketResolvedEnabled) return;
      const message = this.renderTemplate(settings.ticketResolvedTemplate, {
        name: customerName,
        ticketId: String(ticketId),
      });
      await this.sendMessage(customerPhone, message, 'ticket_resolved', customerName);
    } catch (err) {
      this.logger.error('Failed to send ticket resolved notification', err);
    }
  }

  async sendTechAssignedNotification(
    customerPhone: string,
    customerName: string,
    ticketId: number | string,
    techName: string,
  ): Promise<void> {
    try {
      const settings = await this.getSupportSettings();
      if (!settings.techAssignedEnabled) return;
      const message = this.renderTemplate(settings.techAssignedTemplate, {
        name: customerName,
        ticketId: String(ticketId),
        techName,
      });
      await this.sendMessage(customerPhone, message, 'tech_assigned', customerName);
    } catch (err) {
      this.logger.error('Failed to send tech assigned notification', err);
    }
  }
}
