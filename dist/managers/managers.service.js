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
exports.ManagersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manager_entity_1 = require("./entities/manager.entity");
let ManagersService = class ManagersService {
    managersRepository;
    constructor(managersRepository) {
        this.managersRepository = managersRepository;
    }
    create(dto) {
        return this.managersRepository.save(this.managersRepository.create(dto));
    }
    async findAll() {
        const managers = await this.managersRepository.find({ order: { name: 'ASC' } });
        const counts = await this.managersRepository.manager.query(`SELECT "managerId", COUNT(*) as count FROM "subscriber" WHERE "managerId" IS NOT NULL GROUP BY "managerId"`);
        const countMap = new Map(counts.map(r => [r.managerId, parseInt(r.count, 10)]));
        return managers.map(m => ({ ...m, subscriberCount: countMap.get(m.id) ?? 0 }));
    }
    findOne(id) {
        return this.managersRepository.findOneBy({ id });
    }
    async update(id, dto) {
        await this.managersRepository.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.managersRepository.delete(id);
    }
    findByUsername(username) {
        return this.managersRepository.findOneBy({ username });
    }
};
exports.ManagersService = ManagersService;
exports.ManagersService = ManagersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manager_entity_1.Manager)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ManagersService);
//# sourceMappingURL=managers.service.js.map