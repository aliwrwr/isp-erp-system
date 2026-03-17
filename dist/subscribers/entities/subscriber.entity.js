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
exports.Subscriber = void 0;
const typeorm_1 = require("typeorm");
const package_entity_1 = require("../../packages/entities/package.entity");
const subscription_entity_1 = require("../../subscriptions/entities/subscription.entity");
const manager_entity_1 = require("../../managers/entities/manager.entity");
let Subscriber = class Subscriber {
    id;
    name;
    phone;
    secondaryPhone;
    address;
    location;
    macAddress;
    cabinetSector;
    ipAddress;
    username;
    password;
    manager;
    package;
    subscriptions;
    status;
    notes;
    createdAt;
};
exports.Subscriber = Subscriber;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Subscriber.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subscriber.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subscriber.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "secondaryPhone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subscriber.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "macAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "cabinetSector", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subscriber.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => manager_entity_1.Manager, { nullable: true, eager: false }),
    __metadata("design:type", manager_entity_1.Manager)
], Subscriber.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => package_entity_1.Package, pkg => pkg.subscribers),
    __metadata("design:type", package_entity_1.Package)
], Subscriber.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, subscription => subscription.subscriber),
    __metadata("design:type", Array)
], Subscriber.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], Subscriber.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Subscriber.prototype, "createdAt", void 0);
exports.Subscriber = Subscriber = __decorate([
    (0, typeorm_1.Entity)('subscribers')
], Subscriber);
//# sourceMappingURL=subscriber.entity.js.map