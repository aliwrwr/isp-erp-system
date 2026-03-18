"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const QRCode = __importStar(require("qrcode"));
const whatsapp_settings_entity_1 = require("./entities/whatsapp-settings.entity");
const whatsapp_log_entity_1 = require("./entities/whatsapp-log.entity");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    settingsRepository;
    logRepository;
    logger = new common_1.Logger(WhatsappService_1.name);
    client = null;
    qrDataUrl = null;
    isConnected = false;
    phoneNumber = null;
    isInitializing = false;
    constructor(settingsRepository, logRepository) {
        this.settingsRepository = settingsRepository;
        this.logRepository = logRepository;
    }
    async onModuleInit() {
        const count = await this.settingsRepository.count();
        if (count === 0) {
            await this.settingsRepository.save(this.settingsRepository.create({}));
        }
        const settings = await this.settingsRepository.findOne({ where: { id: 1 } });
        if (settings?.autoConnect) {
            this.logger.log('Auto-connect enabled — initializing WhatsApp client...');
            setTimeout(() => this.initializeClient(), 3000);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            try {
                await this.client.destroy();
            }
            catch (_) {
            }
        }
    }
    async initializeClient() {
        if (this.isInitializing)
            return;
        this.isInitializing = true;
        this.qrDataUrl = null;
        this.isConnected = false;
        this.phoneNumber = null;
        try {
            if (this.client) {
                await this.client.destroy().catch(() => { });
                this.client = null;
            }
            this.client = new whatsapp_web_js_1.Client({
                authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: '.wwebjs_auth' }),
                puppeteer: {
                    headless: true,
                    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
            this.client.on('qr', async (qr) => {
                this.logger.log('WhatsApp QR code received — scan to connect');
                this.isConnected = false;
                try {
                    this.qrDataUrl = await QRCode.toDataURL(qr, { scale: 6 });
                }
                catch (err) {
                    this.logger.error('QR generation error', err);
                }
            });
            this.client.on('ready', () => {
                this.isConnected = true;
                this.qrDataUrl = null;
                const info = this.client?.info;
                this.phoneNumber = info?.wid?.user ?? null;
                this.logger.log(`WhatsApp connected — phone: ${this.phoneNumber ?? 'unknown'}`);
            });
            this.client.on('authenticated', () => {
                this.logger.log('WhatsApp authenticated');
            });
            this.client.on('auth_failure', (msg) => {
                this.logger.error(`WhatsApp auth failure: ${msg}`);
                this.isConnected = false;
            });
            this.client.on('disconnected', (reason) => {
                this.logger.warn(`WhatsApp disconnected: ${reason}`);
                this.isConnected = false;
                this.phoneNumber = null;
                this.qrDataUrl = null;
            });
            await this.client.initialize();
        }
        catch (err) {
            this.logger.error('WhatsApp client initialization failed', err);
            this.isConnected = false;
        }
        finally {
            this.isInitializing = false;
        }
    }
    async disconnect() {
        if (this.client) {
            try {
                await this.client.logout();
                await this.client.destroy();
            }
            catch (_) {
            }
            this.client = null;
        }
        this.isConnected = false;
        this.qrDataUrl = null;
        this.phoneNumber = null;
    }
    async changeDevice() {
        if (this.client) {
            try {
                await this.client.logout();
                await this.client.destroy();
            }
            catch (_) { }
            this.client = null;
        }
        this.isConnected = false;
        this.qrDataUrl = null;
        this.phoneNumber = null;
        this.isInitializing = false;
        const fs = await import('fs');
        const path = await import('path');
        const sessionPath = path.resolve('.wwebjs_auth');
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            this.logger.log('WhatsApp session data cleared for device change');
        }
        await this.initializeClient();
    }
    formatPhone(phone) {
        let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleaned.startsWith('07')) {
            cleaned = '964' + cleaned.substring(1);
        }
        return cleaned + '@c.us';
    }
    async sendMessage(phone, message, type = 'manual', subscriberName = '') {
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
        }
        catch (err) {
            this.logger.error(`Failed to send message to ${phone}`, err);
            await this.saveLog(type, phone, subscriberName, message, false, String(err?.message ?? err));
            return false;
        }
    }
    async saveLog(type, phone, subscriberName, message, success, errorMessage) {
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
        }
        catch (_) {
        }
    }
    renderTemplate(template, vars) {
        let result = template;
        for (const [key, value] of Object.entries(vars)) {
            result = result.replaceAll(`{{${key}}}`, String(value));
        }
        return result;
    }
    async sendActivationNotification(subscriberPhone, subscriberName, packageName, endDate) {
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
        }
        catch (err) {
            this.logger.error('Failed to send activation notification', err);
        }
    }
    async sendExpiryWarningNotification(subscriberPhone, subscriberName, packageName, endDate, daysLeft) {
        try {
            const settings = await this.getSettings();
            if (!settings.expiryWarningEnabled)
                return;
            const message = this.renderTemplate(settings.expiryWarningTemplate, {
                name: subscriberName,
                phone: subscriberPhone,
                package: packageName,
                endDate: endDate ? new Date(endDate).toLocaleDateString('ar-IQ') : '—',
                days: daysLeft,
            });
            await this.sendMessage(subscriberPhone, message, 'expiry_warning', subscriberName);
        }
        catch (err) {
            this.logger.error('Failed to send expiry warning notification', err);
        }
    }
    async sendExpiryNotification(subscriberPhone, subscriberName, packageName, endDate) {
        try {
            const settings = await this.getSettings();
            if (!settings.expiryEnabled)
                return;
            const message = this.renderTemplate(settings.expiryTemplate, {
                name: subscriberName,
                phone: subscriberPhone,
                package: packageName,
                endDate: endDate ? new Date(endDate).toLocaleDateString('ar-IQ') : '—',
            });
            await this.sendMessage(subscriberPhone, message, 'expiry', subscriberName);
        }
        catch (err) {
            this.logger.error('Failed to send expiry notification', err);
        }
    }
    async getLogs(page = 1, limit = 10) {
        const [data, total] = await this.logRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data, total };
    }
    async getSettings() {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
        if (!settings) {
            settings = await this.settingsRepository.save(this.settingsRepository.create({}));
        }
        return settings;
    }
    async updateSettings(dto) {
        await this.settingsRepository.update(1, dto);
        return this.getSettings();
    }
    getStatus() {
        return {
            connected: this.isConnected,
            initializing: this.isInitializing,
            phone: this.phoneNumber,
            hasQR: !!this.qrDataUrl,
            qr: this.qrDataUrl,
        };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(whatsapp_settings_entity_1.WhatsappSettings)),
    __param(1, (0, typeorm_1.InjectRepository)(whatsapp_log_entity_1.WhatsappLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map