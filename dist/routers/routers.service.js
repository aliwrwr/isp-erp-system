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
exports.RoutersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const router_entity_1 = require("./entities/router.entity");
let RoutersService = class RoutersService {
    routersRepository;
    constructor(routersRepository) {
        this.routersRepository = routersRepository;
    }
    create(createRouterDto) {
        const router = this.routersRepository.create(createRouterDto);
        return this.routersRepository.save(router);
    }
    findAll() {
        return this.routersRepository.find();
    }
    findOne(id) {
        return this.routersRepository.findOneBy({ id });
    }
    async update(id, updateRouterDto) {
        await this.routersRepository.update(id, updateRouterDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.routersRepository.delete(id);
    }
};
exports.RoutersService = RoutersService;
exports.RoutersService = RoutersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(router_entity_1.Router)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoutersService);
//# sourceMappingURL=routers.service.js.map