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
exports.WhatsappInstallmentsSettings = void 0;
const typeorm_1 = require("typeorm");
let WhatsappInstallmentsSettings = class WhatsappInstallmentsSettings {
    id;
    paymentDueEnabled;
    warningDays;
    paymentDueTemplate;
    overdueEnabled;
    overdueTemplate;
    paymentReceivedEnabled;
    paymentReceivedTemplate;
};
exports.WhatsappInstallmentsSettings = WhatsappInstallmentsSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WhatsappInstallmentsSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappInstallmentsSettings.prototype, "paymentDueEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], WhatsappInstallmentsSettings.prototype, "warningDays", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'عزيزي {{name}} ⚠️\nقسطك بمبلغ {{amount}} د.ع يستحق الدفع خلال {{days}} أيام\nتاريخ الاستحقاق: {{dueDate}}\nرقم العقد: {{contract}}\nيرجى الحضور لسداد القسط في الوقت المحدد.',
    }),
    __metadata("design:type", String)
], WhatsappInstallmentsSettings.prototype, "paymentDueTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappInstallmentsSettings.prototype, "overdueEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'عزيزي {{name}} 🔴\nتأخرت في سداد قسطك بمبلغ {{amount}} د.ع\nتاريخ الاستحقاق كان: {{dueDate}}\nرقم العقد: {{contract}}\nيرجى الحضور لسداد القسط في أقرب وقت.',
    }),
    __metadata("design:type", String)
], WhatsappInstallmentsSettings.prototype, "overdueTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WhatsappInstallmentsSettings.prototype, "paymentReceivedEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        default: 'عزيزي {{name}} ✅\nتم استلام دفعتك بمبلغ {{amount}} د.ع بنجاح\nرقم العقد: {{contract}}\nرقم القسط: {{installmentNo}}\nالمتبقي من العقد: {{remaining}} د.ع\nشكراً لالتزامك.',
    }),
    __metadata("design:type", String)
], WhatsappInstallmentsSettings.prototype, "paymentReceivedTemplate", void 0);
exports.WhatsappInstallmentsSettings = WhatsappInstallmentsSettings = __decorate([
    (0, typeorm_1.Entity)('whatsapp_installments_settings')
], WhatsappInstallmentsSettings);
//# sourceMappingURL=whatsapp-installments-settings.entity.js.map