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
exports.SalariesController = void 0;
const common_1 = require("@nestjs/common");
const salaries_service_1 = require("./salaries.service");
const create_salary_dto_1 = require("./dto/create-salary.dto");
const update_salary_dto_1 = require("./dto/update-salary.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let SalariesController = class SalariesController {
    salariesService;
    constructor(salariesService) {
        this.salariesService = salariesService;
    }
    create(createSalaryDto) {
        return this.salariesService.create(createSalaryDto);
    }
    findAll() {
        return this.salariesService.findAll();
    }
    findOne(id) {
        return this.salariesService.findOne(+id);
    }
    update(id, updateSalaryDto) {
        return this.salariesService.update(+id, updateSalaryDto);
    }
    remove(id) {
        return this.salariesService.remove(+id);
    }
};
exports.SalariesController = SalariesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, permissions_decorator_1.Permissions)('hr.salaries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salary_dto_1.CreateSalaryDto]),
    __metadata("design:returntype", void 0)
], SalariesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, permissions_decorator_1.Permissions)('hr.salaries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalariesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, permissions_decorator_1.Permissions)('hr.salaries'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalariesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, permissions_decorator_1.Permissions)('hr.salaries'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_salary_dto_1.UpdateSalaryDto]),
    __metadata("design:returntype", void 0)
], SalariesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalariesController.prototype, "remove", null);
exports.SalariesController = SalariesController = __decorate([
    (0, swagger_1.ApiTags)('Salaries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('salaries'),
    __metadata("design:paramtypes", [salaries_service_1.SalariesService])
], SalariesController);
//# sourceMappingURL=salaries.controller.js.map