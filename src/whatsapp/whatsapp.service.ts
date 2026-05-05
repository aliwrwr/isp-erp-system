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
  private manualDisconnect = false; // للتمييز بين قطع المستخدم وانقطاع الشبكة
  private initTimeout: ReturnType<typeof setTimeout> | null = null; // مهلة التهيئة

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

    // Auto-connect logic:
    // 1. إذا كانت هناك جلسة محفوظة في .wwebjs_auth → اتصل تلقائياً (بدون QR)
    // 2. إذا كان autoConnect = true → اتصل حتى لو لم توجد جلسة
    const sessionExists = await this.hasExistingSession();
    const settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (sessionExists || settings?.autoConnect) {
      this.logger.log(
        sessionExists
          ? 'Existing WhatsApp session found — reconnecting automatically...'
          : 'Auto-connect enabled — initializing WhatsApp client...',
      );
      // Delay slightly so the DB/ORM is fully ready
      setTimeout(() => this.initializeClient(), 3000);
    }
  }

  /** التحقق من وجود ملفات جلسة واتساب محفوظة (تعني سبق الاتصال) */
  private async hasExistingSession(): Promise<boolean> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      // LocalAuth يحفظ الجلسة في .wwebjs_auth/session-<clientId>/Default
      const authDir = path.join(process.cwd(), '.wwebjs_auth');
      if (!fs.existsSync(authDir)) return false;
      const entries = fs.readdirSync(authDir);
      // يوجد مجلد session إذا كانت هناك جلسة محفوظة
      return entries.some(e => e.startsWith('session'));
    } catch {
      return false;
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

  /** يمسح مهلة التهيئة إن وجدت */
  private clearInitTimeout(): void {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
  }

  async initializeClient(force = false): Promise<void> {
    // إذا كان قيد التهيئة ولم يُجبَر، تجاهل الطلب
    if (this.isInitializing && !force) return;
    // إذا كان مجبراً وهناك تهيئة معلّقة، أوقفها أولاً
    if (force && this.isInitializing) {
      this.clearInitTimeout();
      if (this.client) {
        await this.client.destroy().catch(() => {});
        this.client = null;
      }
      await this.forceKillChromeProcesses();
    }
    this.isInitializing = true;
    this.qrDataUrl = null;
    this.isConnected = false;
    this.phoneNumber = null;

    // مهلة 90 ثانية: إذا لم يُستجَب يُعاد التشغيل تلقائياً
    this.clearInitTimeout();
    this.initTimeout = setTimeout(async () => {
      if (!this.isInitializing) return; // تمّت التهيئة بنجاح
      this.logger.warn('WhatsApp init timed out after 90s — restarting...');
      this.isInitializing = false;
      if (this.client) {
        await this.client.destroy().catch(() => {});
        this.client = null;
      }
      await this.forceKillChromeProcesses();
      // إعادة المحاولة إلا إذا فصل المستخدم يدوياً
      if (!this.manualDisconnect) {
        setTimeout(() => this.initializeClient(), 3000);
      }
    }, 90_000);

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
        this.clearInitTimeout(); // تم الاستجابة — ألغِ المهلة
        this.isConnected = false;
        this.isInitializing = false; // QR visible — no longer "initializing"
        try {
          this.qrDataUrl = await QRCode.toDataURL(qr, { scale: 6 });
        } catch (err) {
          this.logger.error('QR generation error', err);
        }
      });

      this.client.on('ready', () => {
        this.clearInitTimeout(); // تم الاستجابة — ألغِ المهلة
        this.isConnected = true;
        this.isInitializing = false;
        this.qrDataUrl = null;
        const info = (this.client as any)?.info;
        this.phoneNumber = info?.wid?.user ?? null;
        this.logger.log(
          `WhatsApp connected — phone: ${this.phoneNumber ?? 'unknown'}`,
        );
      });

      this.client.on('authenticated', () => {
        this.logger.log('WhatsApp authenticated');
        this.clearInitTimeout(); // تم الاستجابة — ألغِ المهلة
        this.isInitializing = false;
      });

      this.client.on('auth_failure', (msg: any) => {
        this.logger.error(`WhatsApp auth failure: ${msg}`);
        this.clearInitTimeout();
        this.isConnected = false;
        this.isInitializing = false;
      });

      this.client.on('disconnected', (reason: any) => {
        this.logger.warn(`WhatsApp disconnected: ${reason}`);
        this.isConnected = false;
        this.isInitializing = false;
        this.phoneNumber = null;
        this.qrDataUrl = null;

        // إعادة الاتصال تلقائياً إذا لم يكن القطع من قِبل المستخدم
        // وإذا كانت هناك جلسة محفوظة (بدون QR)
        if (!this.manualDisconnect && reason !== 'LOGOUT') {
          this.logger.log(`Auto-reconnecting after disconnection (reason: ${reason})...`);
          setTimeout(() => this.initializeClient(), 5000);
        } else {
          this.manualDisconnect = false;
        }
      });

      // initialize() runs in background — do NOT await it
      // isInitializing stays true until qr/ready/auth_failure fires
      this.client.initialize().catch((err) => {
        this.logger.error('WhatsApp client initialization failed', err);
        this.isConnected = false;
        this.isInitializing = false;
      });
    } catch (err) {
      this.logger.error('WhatsApp client setup failed', err);
      this.isConnected = false;
      this.isInitializing = false;
    }
  }

  async disconnect(): Promise<void> {
    this.manualDisconnect = true; // منع إعادة الاتصال التلقائية
    this.clearInitTimeout();
    if (this.client) {
      try {
        // destroy() stops the browser without revoking the session,
        // so next connect() reuses the saved auth (no QR needed)
        await this.client.destroy();
      } catch (_) {
        // ignore
      }
      this.client = null;
    }
    this.isConnected = false;
    this.isInitializing = false;
    this.qrDataUrl = null;
    this.phoneNumber = null;
  }

  /**
   * Run a deep cleanup of any lingering Chrome processes locking the session
   */
  private async forceKillChromeProcesses(): Promise<void> {
    const { exec } = await import('child_process');
    return new Promise((resolve) => {
      // Kills any chrome.exe process that has "wwebjs" in its command line
      const cmd = `powershell.exe -NonInteractive -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'chrome.exe'\\" | Where-Object CommandLine -match \\"wwebjs\\" | Invoke-CimMethod -MethodName Terminate"`;
      exec(cmd, () => {
        resolve();
      });
    });
  }

  /**
   * Change WhatsApp device: wipe saved session files then re-init
   * so a fresh QR code is generated for a new phone.
   */
  async changeDevice(): Promise<void> {
    // Forcefully stop any running client
    if (this.client) {
      try { await this.client.destroy(); } catch (_) {}
      this.client = null;
    }
    this.isConnected = false;
    this.qrDataUrl = null;
    this.phoneNumber = null;
    this.isInitializing = false;

    // Forcefully kill any zombie chrome.exe holding locks
    await this.forceKillChromeProcesses();

    // Load fs and path
    const fs = await import('fs');
    const path = await import('path');
    const sessionPath = path.resolve('.wwebjs_auth');

    // Wait and retry up to 10 seconds for Chrome to fully close before deleting session files
    for (let i = 0; i < 10; i++) {
      if (!fs.existsSync(sessionPath)) break;
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        this.logger.log('WhatsApp session data cleared for device change');
        break;
      } catch (rmErr) {
        this.logger.warn(`Could not delete session folder yet (locked?). Retrying... (${i + 1}/10)`);
        await new Promise(r => setTimeout(r, 1000));
      }
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
      select: ['id', 'createdAt', 'type', 'phone', 'subscriberName', 'success', 'message'],
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
