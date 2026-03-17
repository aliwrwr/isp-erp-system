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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappSettings = void 0;
const typeorm_1 = require("typeorm");
let WhatsappSettings = class WhatsappSettings {
    id;
    activationEnabled;
    expiryWarningEnabled;
    expiryEnabled;
    warningDays;
    activationTemplate;
    expiryWarningTemplate;
    expiryTemplate;
};
exports.WhatsappSettings = WhatsappSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WhatsappSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSettings.prototype, "activationEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSettings.prototype, "expiryWarningEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSettings.prototype, "expiryEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], WhatsappSettings.prototype, "warningDays", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'مرحباً {{name}} 👋\nتم تفعيل اشتراكك في خدمة الإنترنت بنجاح ✅\n📦 الباقة: {{package}}\n📅 تاريخ الانتهاء: {{endDate}}\nللاستفسار تواصل معنا.',
    }),
    __metadata("design:type", String)
], WhatsappSettings.prototype, "activationTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'عزيزي {{name}} ⚠️\nاشتراكك في خدمة الإنترنت سينتهي خلال {{days}} أيام 📅\nتاريخ الانتهاء: {{endDate}}\nيرجى التجديد للاستمرار في الاستمتاع بالخدمة.',
    }),
    __metadata("design:type", String)
], WhatsappSettings.prototype, "expiryWarningTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'عزيزي {{name}} 🔴\nاشتراكك في خدمة الإنترنت قد انتهى اليوم.\nيرجى التجديد لاستئناف الخدمة. تواصل معنا.',
    }),
    __metadata("design:type", String)
], WhatsappSettings.prototype, "expiryTemplate", void 0);
exports.WhatsappSettings = WhatsappSettings = __decorate([
    (0, typeorm_1.Entity)('whatsapp_settings')
], WhatsappSettings);
//# sourceMappingURL=whatsapp-settings.entity.js.map