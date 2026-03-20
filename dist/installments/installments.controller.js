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
exports.InstallmentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const installments_service_1 = require("./installments.service");
let InstallmentsController = class InstallmentsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    dashboard() { return this.svc.getDashboard(); }
    findCustomers(s) { return this.svc.findAllCustomers(s); }
    findOneCustomer(id) { return this.svc.findOneCustomer(+id); }
    createCustomer(dto) { return this.svc.createCustomer(dto); }
    updateCustomer(id, dto) { return this.svc.updateCustomer(+id, dto); }
    removeCustomer(id) { return this.svc.removeCustomer(+id); }
    findContracts(s, q) { return this.svc.findAllContracts(s, q); }
    findOneContract(id) { return this.svc.findOneContract(+id); }
    createContract(dto) { return this.svc.createContract(dto); }
    updateContract(id, dto) { return this.svc.updateContract(+id, dto); }
    removeContract(id) { return this.svc.removeContract(+id); }
    getAllPayments(from, to) { return this.svc.getAllPayments(from, to); }
    getPayments(id) { return this.svc.findPaymentsByContract(+id); }
    addPayment(id, dto) { return this.svc.addPayment(+id, dto); }
    removePayment(id) { return this.svc.removePayment(+id); }
    getReports(from, to) { return this.svc.getReports(from, to); }
};
exports.InstallmentsController = InstallmentsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('customers'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findCustomers", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findOneCustomer", null);
__decorate([
    (0, common_1.Post)('customers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Patch)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "removeCustomer", null);
__decorate([
    (0, common_1.Get)('contracts'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findContracts", null);
__decorate([
    (0, common_1.Get)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findOneContract", null);
__decorate([
    (0, common_1.Post)('contracts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "createContract", null);
__decorate([
    (0, common_1.Patch)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Delete)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "removeContract", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Get)('contracts/:id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('contracts/:id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Delete)('contracts/:contractId/payments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "removePayment", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getReports", null);
exports.InstallmentsController = InstallmentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('installments'),
    __metadata("design:paramtypes", [installments_service_1.InstallmentsService])
], InstallmentsController);
//# sourceMappingURL=installments.controller.js.map