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
exports.SystemSettings = void 0;
const typeorm_1 = require("typeorm");
let SystemSettings = class SystemSettings {
    id;
    companyName;
    companyPhone;
    companyEmail;
    companyAddress;
    logoBase64;
    defaultDuration;
    expiryWarningDays;
    currency;
    autoRenew;
    notifyExpiry;
    notifyNewSub;
    notifyDebt;
    pageSize;
    dateFormat;
    showExpired;
};
exports.SystemSettings = SystemSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "companyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "companyEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "companyAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: '' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "logoBase64", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30 }),
    __metadata("design:type", Number)
], SystemSettings.prototype, "defaultDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], SystemSettings.prototype, "expiryWarningDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'IQD' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SystemSettings.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SystemSettings.prototype, "notifyExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SystemSettings.prototype, "notifyNewSub", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SystemSettings.prototype, "notifyDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 25 }),
    __metadata("design:type", Number)
], SystemSettings.prototype, "pageSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'YYYY-MM-DD' }),
    __metadata("design:type", String)
], SystemSettings.prototype, "dateFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SystemSettings.prototype, "showExpired", void 0);
exports.SystemSettings = SystemSettings = __decorate([
    (0, typeorm_1.Entity)('system_settings')
], SystemSettings);
//# sourceMappingURL=system-settings.entity.js.map