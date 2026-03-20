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
exports.InstallmentCustomer = void 0;
const typeorm_1 = require("typeorm");
const installment_contract_entity_1 = require("./installment-contract.entity");
let InstallmentCustomer = class InstallmentCustomer {
    id;
    name;
    phone;
    phone2;
    address;
    nationalId;
    notes;
    status;
    createdAt;
    contracts;
};
exports.InstallmentCustomer = InstallmentCustomer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InstallmentCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "phone2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], InstallmentCustomer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InstallmentCustomer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => installment_contract_entity_1.InstallmentContract, c => c.customer),
    __metadata("design:type", Array)
], InstallmentCustomer.prototype, "contracts", void 0);
exports.InstallmentCustomer = InstallmentCustomer = __decorate([
    (0, typeorm_1.Entity)('installment_customers')
], InstallmentCustomer);
//# sourceMappingURL=installment-customer.entity.js.map