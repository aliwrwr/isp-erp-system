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
exports.InstallmentPayment = void 0;
const typeorm_1 = require("typeorm");
const installment_contract_entity_1 = require("./installment-contract.entity");
let InstallmentPayment = class InstallmentPayment {
    id;
    contract;
    amount;
    date;
    notes;
    status;
    receivedBy;
    createdAt;
};
exports.InstallmentPayment = InstallmentPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InstallmentPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => installment_contract_entity_1.InstallmentContract, c => c.payments),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", installment_contract_entity_1.InstallmentContract)
], InstallmentPayment.prototype, "contract", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InstallmentPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InstallmentPayment.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentPayment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'paid' }),
    __metadata("design:type", String)
], InstallmentPayment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentPayment.prototype, "receivedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InstallmentPayment.prototype, "createdAt", void 0);
exports.InstallmentPayment = InstallmentPayment = __decorate([
    (0, typeorm_1.Entity)('installment_payments')
], InstallmentPayment);
//# sourceMappingURL=installment-payment.entity.js.map