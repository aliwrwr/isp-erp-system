"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const router_entity_1 = require("./entities/router.entity");
const routers_controller_1 = require("./routers.controller");
const routers_service_1 = require("./routers.service");
const mikrotik_service_1 = require("./mikrotik.service");
let RoutersModule = class RoutersModule {
};
exports.RoutersModule = RoutersModule;
exports.RoutersModule = RoutersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([router_entity_1.Router])],
        controllers: [routers_controller_1.RoutersController],
        providers: [routers_service_1.RoutersService, mikrotik_service_1.MikrotikService],
        exports: [routers_service_1.RoutersService, mikrotik_service_1.MikrotikService],
    })
], RoutersModule);
//# sourceMappingURL=routers.module.js.map