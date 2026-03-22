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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
const employees_service_1 = require("../../employees/employees.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    usersService;
    employeesService;
    constructor(configService, usersService, employeesService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'default-secret'),
        });
        this.configService = configService;
        this.usersService = usersService;
        this.employeesService = employeesService;
    }
    async validate(payload) {
        if (payload.type === 'manager') {
            return {
                userId: payload.sub,
                username: payload.email,
                name: payload.name,
                type: 'manager',
                managerId: payload.sub,
                isSuperAdmin: false,
                permissions: payload.permissions || [],
            };
        }
        const user = await this.usersService.findOne(payload.sub);
        if (!user)
            return null;
        const employee = await this.employeesService.findByUsername(user.email);
        const isSuperAdmin = user.roles?.some(r => r.name === 'Super Admin');
        return {
            userId: user.id,
            username: user.email,
            type: 'user',
            roles: user.roles,
            isSuperAdmin,
            employeeId: employee?.id || null,
            departmentId: employee?.department?.id || null,
            permissions: isSuperAdmin ? ['*'] : (employee?.department?.permissions || []),
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        employees_service_1.EmployeesService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map