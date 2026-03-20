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
exports.WhatsappSupportSettings = void 0;
const typeorm_1 = require("typeorm");
let WhatsappSupportSettings = class WhatsappSupportSettings {
    id;
    ticketCreatedEnabled;
    ticketCreatedTemplate;
    ticketResolvedEnabled;
    ticketResolvedTemplate;
    techAssignedEnabled;
    techAssignedTemplate;
};
exports.WhatsappSupportSettings = WhatsappSupportSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WhatsappSupportSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSupportSettings.prototype, "ticketCreatedEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'مرحباً {{name}} 👋\nتم استلام طلب الدعم الفني رقم #{{ticketId}}\nالموضوع: {{description}}\nسيتم التواصل معك في أقرب وقت.',
    }),
    __metadata("design:type", String)
], WhatsappSupportSettings.prototype, "ticketCreatedTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSupportSettings.prototype, "ticketResolvedEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'مرحباً {{name}} ✅\nتم حل طلب الدعم الفني رقم #{{ticketId}} بنجاح\nنأمل أن تكون الخدمة مرضية. للاستفسار تواصل معنا.',
    }),
    __metadata("design:type", String)
], WhatsappSupportSettings.prototype, "ticketResolvedTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappSupportSettings.prototype, "techAssignedEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'مرحباً {{name}} 🔧\nتم تعيين الفني {{techName}} لمعالجة طلبك رقم #{{ticketId}}\nسيتواصل معك قريباً.',
    }),
    __metadata("design:type", String)
], WhatsappSupportSettings.prototype, "techAssignedTemplate", void 0);
exports.WhatsappSupportSettings = WhatsappSupportSettings = __decorate([
    (0, typeorm_1.Entity)('whatsapp_support_settings')
], WhatsappSupportSettings);
//# sourceMappingURL=whatsapp-support-settings.entity.js.map