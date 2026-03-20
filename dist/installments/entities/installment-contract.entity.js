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
exports.InstallmentContract = void 0;
const typeorm_1 = require("typeorm");
const installment_customer_entity_1 = require("./installment-customer.entity");
const installment_payment_entity_1 = require("./installment-payment.entity");
let InstallmentContract = class InstallmentContract {
    id;
    contractNumber;
    customer;
    productName;
    productDescription;
    totalPrice;
    downPayment;
    remainingAmount;
    installmentAmount;
    installmentCount;
    paidCount;
    startDate;
    nextDueDate;
    frequency;
    status;
    guarantorName;
    guarantorPhone;
    notes;
    createdAt;
    payments;
};
exports.InstallmentContract = InstallmentContract;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "contractNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => installment_customer_entity_1.InstallmentCustomer, c => c.contracts, { eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", installment_customer_entity_1.InstallmentCustomer)
], InstallmentContract.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InstallmentContract.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "productDescription", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "downPayment", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "installmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "installmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], InstallmentContract.prototype, "paidCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InstallmentContract.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "nextDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'monthly' }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "guarantorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "guarantorPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentContract.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InstallmentContract.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => installment_payment_entity_1.InstallmentPayment, p => p.contract, { eager: true }),
    __metadata("design:type", Array)
], InstallmentContract.prototype, "payments", void 0);
exports.InstallmentContract = InstallmentContract = __decorate([
    (0, typeorm_1.Entity)('installment_contracts')
], InstallmentContract);
//# sourceMappingURL=installment-contract.entity.js.map