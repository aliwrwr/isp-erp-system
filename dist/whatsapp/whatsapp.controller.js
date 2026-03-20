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
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const whatsapp_service_1 = require("./whatsapp.service");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const update_installments_settings_dto_1 = require("./dto/update-installments-settings.dto");
const update_support_settings_dto_1 = require("./dto/update-support-settings.dto");
const send_test_dto_1 = require("./dto/send-test.dto");
let WhatsappController = class WhatsappController {
    whatsappService;
    scheduler;
    constructor(whatsappService, scheduler) {
        this.whatsappService = whatsappService;
        this.scheduler = scheduler;
    }
    getStatus() {
        return this.whatsappService.getStatus();
    }
    async connect() {
        await this.whatsappService.initializeClient();
        return { message: 'تم بدء تهيئة الاتصال' };
    }
    async disconnect() {
        await this.whatsappService.disconnect();
        return { message: 'تم قطع الاتصال' };
    }
    async changeDevice() {
        await this.whatsappService.changeDevice();
        return { message: 'تم مسح الجلسة — امسح رمز QR لربط جهاز جديد' };
    }
    async sendTest(dto) {
        const sent = await this.whatsappService.sendMessage(dto.phone, dto.message);
        return {
            success: sent,
            message: sent ? 'تم إرسال الرسالة بنجاح' : 'فشل الإرسال — تأكد من الاتصال',
        };
    }
    getSettings() {
        return this.whatsappService.getSettings();
    }
    updateSettings(dto) {
        return this.whatsappService.updateSettings(dto);
    }
    getExpiring(days) {
        return this.scheduler.getExpiringSoon(days ? parseInt(days, 10) : 7);
    }
    sendNow() {
        return this.scheduler.sendNowForDate();
    }
    async sendDirect(dto) {
        const sent = await this.whatsappService.sendMessage(dto.phone, dto.message);
        return {
            success: sent,
            message: sent ? 'تم إرسال الرسالة بنجاح' : 'فشل الإرسال — تأكد من اتصال واتساب',
        };
    }
    getLogs(page, limit) {
        return this.whatsappService.getLogs(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
    }
    getInstallmentsSettings() {
        return this.whatsappService.getInstallmentsSettings();
    }
    updateInstallmentsSettings(dto) {
        return this.whatsappService.updateInstallmentsSettings(dto);
    }
    getSupportSettings() {
        return this.whatsappService.getSupportSettings();
    }
    updateSupportSettings(dto) {
        return this.whatsappService.updateSupportSettings(dto);
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('connect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)('change-device'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "changeDevice", null);
__decorate([
    (0, common_1.Post)('send-test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_test_dto_1.SendTestMessageDto]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendTest", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateWhatsappSettingsDto]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('expiring'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getExpiring", null);
__decorate([
    (0, common_1.Post)('send-now'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "sendNow", null);
__decorate([
    (0, common_1.Post)('send-direct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_test_dto_1.SendTestMessageDto]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendDirect", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('settings-installments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getInstallmentsSettings", null);
__decorate([
    (0, common_1.Patch)('settings-installments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_installments_settings_dto_1.UpdateInstallmentsSettingsDto]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "updateInstallmentsSettings", null);
__decorate([
    (0, common_1.Get)('settings-support'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getSupportSettings", null);
__decorate([
    (0, common_1.Patch)('settings-support'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_support_settings_dto_1.UpdateSupportSettingsDto]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "updateSupportSettings", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        notification_scheduler_service_1.NotificationSchedulerService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map