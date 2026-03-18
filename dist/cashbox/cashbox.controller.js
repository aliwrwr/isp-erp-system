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
exports.CashboxController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const cashbox_service_1 = require("./cashbox.service");
let CashboxController = class CashboxController {
    service;
    constructor(service) {
        this.service = service;
    }
    summary() {
        return this.service.summary();
    }
    ledger(search, type, source, dateFrom, dateTo, page, limit) {
        return this.service.ledger({
            search, type, source, dateFrom, dateTo,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
    }
    createManual(dto) {
        return this.service.createManual(dto);
    }
    removeManual(id) {
        return this.service.removeManual(+id);
    }
};
exports.CashboxController = CashboxController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CashboxController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('ledger'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('source')),
    __param(3, (0, common_1.Query)('dateFrom')),
    __param(4, (0, common_1.Query)('dateTo')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CashboxController.prototype, "ledger", null);
__decorate([
    (0, common_1.Post)('manual'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CashboxController.prototype, "createManual", null);
__decorate([
    (0, common_1.Delete)('manual/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashboxController.prototype, "removeManual", null);
exports.CashboxController = CashboxController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cashbox'),
    __metadata("design:paramtypes", [cashbox_service_1.CashboxService])
], CashboxController);
//# sourceMappingURL=cashbox.controller.js.map