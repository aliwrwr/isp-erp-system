"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = UsersService_1 = class UsersService {
    usersRepository;
    rolesRepository;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(usersRepository, rolesRepository) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
    }
    async onModuleInit() {
        let superAdminRole = await this.rolesRepository.findOne({ where: { name: 'Super Admin' } });
        if (!superAdminRole) {
            superAdminRole = this.rolesRepository.create({ name: 'Super Admin' });
            superAdminRole = await this.rolesRepository.save(superAdminRole);
            this.logger.log('Created Super Admin role');
        }
        const userCount = await this.usersRepository.count();
        if (userCount === 0) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash('admin123', salt);
            const adminUser = this.usersRepository.create({
                name: 'Admin',
                email: 'admin@isp.com',
                password: hashedPassword,
                roles: [superAdminRole],
            });
            await this.usersRepository.save(adminUser);
            this.logger.log('Created default admin user: admin@isp.com / admin123');
        }
    }
    async create(createUserDto) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        let roles = [];
        if (createUserDto.roles && createUserDto.roles.length > 0) {
            roles = await this.rolesRepository.find({
                where: { name: (0, typeorm_2.In)(createUserDto.roles) },
            });
        }
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            roles,
        });
        return this.usersRepository.save(user);
    }
    findAll() {
        return this.usersRepository.find({ relations: ['roles'] });
    }
    findOne(id) {
        return this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
    }
    findByEmail(email) {
        return this.usersRepository.findOne({ where: { email }, relations: ['roles'] });
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
        }
        let roles = undefined;
        if (updateUserDto.roles && updateUserDto.roles.length > 0) {
            roles = await this.rolesRepository.find({
                where: { name: (0, typeorm_2.In)(updateUserDto.roles) },
            });
        }
        const { roles: _, ...updateData } = updateUserDto;
        await this.usersRepository.update(id, updateData);
        if (roles) {
            const user = await this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
            if (user) {
                user.roles = roles;
                await this.usersRepository.save(user);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map