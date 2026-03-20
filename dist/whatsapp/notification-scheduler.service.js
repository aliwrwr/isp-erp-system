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
var NotificationSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const subscriber_entity_1 = require("../subscribers/entities/subscriber.entity");
const router_entity_1 = require("../routers/entities/router.entity");
const whatsapp_service_1 = require("./whatsapp.service");
const mikrotik_service_1 = require("../routers/mikrotik.service");
let NotificationSchedulerService = NotificationSchedulerService_1 = class NotificationSchedulerService {
    subscriptionsRepository;
    subscriberRepository;
    routerRepository;
    whatsappService;
    mikrotikService;
    logger = new common_1.Logger(NotificationSchedulerService_1.name);
    constructor(subscriptionsRepository, subscriberRepository, routerRepository, whatsappService, mikrotikService) {
        this.subscriptionsRepository = subscriptionsRepository;
        this.subscriberRepository = subscriberRepository;
        this.routerRepository = routerRepository;
        this.whatsappService = whatsappService;
        this.mikrotikService = mikrotikService;
    }
    async sendDailyNotifications() {
        this.logger.log('Running daily WhatsApp notification check...');
        const settings = await this.whatsappService.getSettings();
        if (!settings.expiryWarningEnabled && !settings.expiryEnabled) {
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (settings.expiryEnabled) {
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            const expiredToday = await this.subscriptionsRepository.find({
                where: { endDate: (0, typeorm_2.Between)(today, todayEnd), status: 'active' },
                relations: ['subscriber', 'package'],
            });
            for (const sub of expiredToday) {
                const subscriber = sub.subscriber;
                const pkg = sub.package;
                if (!subscriber?.phone)
                    continue;
                const message = this.whatsappService.renderTemplate(settings.expiryTemplate, {
                    name: subscriber.name ?? '',
                    phone: subscriber.phone ?? '',
                    endDate: this.formatDate(sub.endDate),
                    package: pkg?.name ?? '',
                });
                const sent = await this.whatsappService.sendMessage(subscriber.phone, message);
                this.logger.log(`Expiry notification to ${subscriber.name} (${subscriber.phone}): ${sent ? 'sent' : 'failed'}`);
            }
        }
        if (settings.expiryWarningEnabled) {
            const warningDate = new Date(today);
            warningDate.setDate(warningDate.getDate() + settings.warningDays);
            const warningDateEnd = new Date(warningDate);
            warningDateEnd.setHours(23, 59, 59, 999);
            warningDate.setHours(0, 0, 0, 0);
            const expiringSoon = await this.subscriptionsRepository.find({
                where: {
                    endDate: (0, typeorm_2.Between)(warningDate, warningDateEnd),
                    status: 'active',
                },
                relations: ['subscriber', 'package'],
            });
            for (const sub of expiringSoon) {
                const subscriber = sub.subscriber;
                const pkg = sub.package;
                if (!subscriber?.phone)
                    continue;
                const message = this.whatsappService.renderTemplate(settings.expiryWarningTemplate, {
                    name: subscriber.name ?? '',
                    phone: subscriber.phone ?? '',
                    endDate: this.formatDate(sub.endDate),
                    package: pkg?.name ?? '',
                    days: settings.warningDays,
                });
                const sent = await this.whatsappService.sendMessage(subscriber.phone, message);
                this.logger.log(`Warning notification to ${subscriber.name} (${subscriber.phone}): ${sent ? 'sent' : 'failed'}`);
            }
        }
    }
    async sendNowForDate(targetDate) {
        const settings = await this.whatsappService.getSettings();
        const date = targetDate ?? new Date();
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);
        let sent = 0;
        let failed = 0;
        if (settings.expiryEnabled) {
            const expiredToday = await this.subscriptionsRepository.find({
                where: { endDate: (0, typeorm_2.Between)(date, dateEnd), status: 'active' },
                relations: ['subscriber', 'package'],
            });
            for (const sub of expiredToday) {
                const subscriber = sub.subscriber;
                const pkg = sub.package;
                if (!subscriber?.phone)
                    continue;
                const message = this.whatsappService.renderTemplate(settings.expiryTemplate, {
                    name: subscriber.name ?? '',
                    phone: subscriber.phone ?? '',
                    endDate: this.formatDate(sub.endDate),
                    package: pkg?.name ?? '',
                });
                const ok = await this.whatsappService.sendMessage(subscriber.phone, message);
                ok ? sent++ : failed++;
            }
        }
        if (settings.expiryWarningEnabled) {
            const warningDate = new Date(date);
            warningDate.setDate(warningDate.getDate() + settings.warningDays);
            const warningDateEnd = new Date(warningDate);
            warningDateEnd.setHours(23, 59, 59, 999);
            warningDate.setHours(0, 0, 0, 0);
            const expiringSoon = await this.subscriptionsRepository.find({
                where: {
                    endDate: (0, typeorm_2.Between)(warningDate, warningDateEnd),
                    status: 'active',
                },
                relations: ['subscriber', 'package'],
            });
            for (const sub of expiringSoon) {
                const subscriber = sub.subscriber;
                const pkg = sub.package;
                if (!subscriber?.phone)
                    continue;
                const message = this.whatsappService.renderTemplate(settings.expiryWarningTemplate, {
                    name: subscriber.name ?? '',
                    phone: subscriber.phone ?? '',
                    endDate: this.formatDate(sub.endDate),
                    package: pkg?.name ?? '',
                    days: settings.warningDays,
                });
                const ok = await this.whatsappService.sendMessage(subscriber.phone, message);
                ok ? sent++ : failed++;
            }
        }
        return { sent, failed };
    }
    async getExpiringSoon(days = 7) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = new Date(today);
        future.setDate(future.getDate() + days);
        future.setHours(23, 59, 59, 999);
        const subs = await this.subscriptionsRepository.find({
            where: {
                endDate: (0, typeorm_2.Between)(today, future),
                status: 'active',
            },
            relations: ['subscriber', 'package'],
            order: { endDate: 'ASC' },
        });
        return subs.map((s) => ({
            id: s.id,
            subscriberName: s.subscriber?.name,
            subscriberPhone: s.subscriber?.phone,
            package: s.package?.name,
            endDate: s.endDate,
            daysLeft: Math.ceil((new Date(s.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    }
    async autoExpireSubscriptions() {
        this.logger.log('Running auto-expire check for subscriptions...');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const expired = await this.subscriptionsRepository.find({
            where: { endDate: (0, typeorm_2.LessThan)(now), status: 'active' },
            relations: ['subscriber', 'subscriber.router'],
        });
        if (expired.length === 0) {
            this.logger.log('No expired subscriptions found.');
            return;
        }
        this.logger.log(`Found ${expired.length} expired subscription(s). Processing...`);
        const processedSubscribers = new Set();
        for (const sub of expired) {
            await this.subscriptionsRepository.update(sub.id, { status: 'expired' }).catch(() => { });
            const subscriber = sub.subscriber;
            if (!subscriber?.id || processedSubscribers.has(subscriber.id))
                continue;
            processedSubscribers.add(subscriber.id);
            await this.subscriberRepository.update(subscriber.id, { isEnabled: false }).catch(() => { });
            this.logger.log(`Disabled subscriber: ${subscriber.name} (id=${subscriber.id})`);
            if (this.mikrotikService && subscriber.router) {
                const router = subscriber.router;
                await this.mikrotikService.setPppoeSecretEnabled(router, subscriber.username, false).catch(() => { });
                await this.mikrotikService.disconnectByUsername(router, subscriber.username).catch(() => { });
                this.logger.log(`MikroTik: disabled+disconnected ${subscriber.username} on ${router.ipAddress}`);
            }
        }
        this.logger.log(`Auto-expire complete. Processed ${processedSubscribers.size} subscriber(s).`);
    }
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }
};
exports.NotificationSchedulerService = NotificationSchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerService.prototype, "sendDailyNotifications", null);
__decorate([
    (0, schedule_1.Cron)('1 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerService.prototype, "autoExpireSubscriptions", null);
exports.NotificationSchedulerService = NotificationSchedulerService = NotificationSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(subscriber_entity_1.Subscriber)),
    __param(2, (0, typeorm_1.InjectRepository)(router_entity_1.Router)),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService,
        mikrotik_service_1.MikrotikService])
], NotificationSchedulerService);
//# sourceMappingURL=notification-scheduler.service.js.map