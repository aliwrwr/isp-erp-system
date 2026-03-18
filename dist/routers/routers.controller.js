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
exports.RoutersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const routers_service_1 = require("./routers.service");
const mikrotik_service_1 = require("./mikrotik.service");
const create_router_dto_1 = require("./dto/create-router.dto");
const update_router_dto_1 = require("./dto/update-router.dto");
const subscriber_entity_1 = require("../subscribers/entities/subscriber.entity");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let RoutersController = class RoutersController {
    routersService;
    mikrotikService;
    subscriberRepo;
    constructor(routersService, mikrotikService, subscriberRepo) {
        this.routersService = routersService;
        this.mikrotikService = mikrotikService;
        this.subscriberRepo = subscriberRepo;
    }
    async getAllConnections() {
        const routers = await this.routersService.findAll();
        const subscribers = await this.subscriberRepo.find({ relations: ['package'] });
        const subMap = new Map(subscribers.map(s => [s.username.toLowerCase(), s]));
        const results = [];
        await Promise.allSettled(routers.map(async (router) => {
            try {
                const conns = await this.mikrotikService.getActiveConnections(router);
                for (const conn of conns) {
                    const sub = subMap.get(conn.name.toLowerCase());
                    const connStatus = !sub ? 'unknown' : sub.status === 'active' ? 'active' : 'disabled';
                    results.push({
                        ...conn,
                        routerId: router.id,
                        routerName: router.name,
                        subscriberId: sub?.id ?? null,
                        subscriberName: sub?.name ?? '',
                        packageName: sub?.package?.name ?? '',
                        subscriberStatus: connStatus,
                    });
                }
            }
            catch (_) { }
        }));
        return results;
    }
    async disconnectSession(id, body) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return { success: false, message: 'Router not found' };
        const ok = await this.mikrotikService.disconnectPppSession(router, body.sessionId);
        return { success: ok, message: ok ? 'تم قطع الاتصال' : 'فشل قطع الاتصال' };
    }
    create(createRouterDto) {
        return this.routersService.create(createRouterDto);
    }
    findAll() {
        return this.routersService.findAll();
    }
    findOne(id) {
        return this.routersService.findOne(+id);
    }
    update(id, updateRouterDto) {
        return this.routersService.update(+id, updateRouterDto);
    }
    remove(id) {
        return this.routersService.remove(+id);
    }
    async getStatus(id) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return { online: false, error: 'Router not found' };
        return this.mikrotikService.getStatus(router);
    }
    async getInterfaces(id) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return [];
        return this.mikrotikService.getInterfaces(router);
    }
    async getActiveConnections(id) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return [];
        return this.mikrotikService.getActiveConnections(router);
    }
    async getIpAddresses(id) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return [];
        return this.mikrotikService.getIpAddresses(router);
    }
    async ping(id) {
        const router = await this.routersService.findOne(+id);
        if (!router)
            return { online: false };
        const online = await this.mikrotikService.ping(router);
        return { online };
    }
};
exports.RoutersController = RoutersController;
__decorate([
    (0, common_1.Get)('connections'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.connected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "getAllConnections", null);
__decorate([
    (0, common_1.Post)(':id/disconnect-session'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.connected'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "disconnectSession", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_router_dto_1.CreateRouterDto]),
    __metadata("design:returntype", void 0)
], RoutersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoutersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoutersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_router_dto_1.UpdateRouterDto]),
    __metadata("design:returntype", void 0)
], RoutersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoutersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)(':id/interfaces'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "getInterfaces", null);
__decorate([
    (0, common_1.Get)(':id/active-connections'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "getActiveConnections", null);
__decorate([
    (0, common_1.Get)(':id/ip-addresses'),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "getIpAddresses", null);
__decorate([
    (0, common_1.Post)(':id/ping'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Super Admin', 'Network Admin'),
    (0, permissions_decorator_1.Permissions)('internet.routers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "ping", null);
exports.RoutersController = RoutersController = __decorate([
    (0, swagger_1.ApiTags)('Routers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('routers'),
    __param(2, (0, typeorm_1.InjectRepository)(subscriber_entity_1.Subscriber)),
    __metadata("design:paramtypes", [routers_service_1.RoutersService,
        mikrotik_service_1.MikrotikService,
        typeorm_2.Repository])
], RoutersController);
//# sourceMappingURL=routers.controller.js.map