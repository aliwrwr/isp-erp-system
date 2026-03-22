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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const employees_service_1 = require("../employees/employees.service");
const managers_service_1 = require("../managers/managers.service");
const groups_service_1 = require("../groups/groups.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    employeesService;
    managersService;
    groupsService;
    constructor(usersService, jwtService, employeesService, managersService, groupsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.employeesService = employeesService;
        this.managersService = managersService;
        this.groupsService = groupsService;
    }
    async validateUser(emailOrUsername, pass) {
        const user = await this.usersService.findByEmail(emailOrUsername);
        if (!user)
            return null;
        const passwordMatch = await bcrypt.compare(pass, user.password);
        if (!passwordMatch)
            return null;
        const { password, ...result } = user;
        return result;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (user) {
            const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
            if (!passwordMatch)
                throw new common_1.UnauthorizedException('كلمة المرور غير صحيحة');
            const payload = { email: user.email, sub: user.id, type: 'user', roles: user.roles.map(r => r.name) };
            return { access_token: this.jwtService.sign(payload) };
        }
        const manager = await this.managersService.findByUsername(loginDto.email);
        if (!manager)
            throw new common_1.UnauthorizedException('اسم الدخول غير مسجل في النظام');
        if (!manager.password)
            throw new common_1.UnauthorizedException('كلمة المرور غير محددة لهذا الحساب');
        const passwordMatch = await bcrypt.compare(loginDto.password, manager.password);
        if (!passwordMatch)
            throw new common_1.UnauthorizedException('كلمة المرور غير صحيحة');
        let permissions = [];
        if (manager.groupId) {
            const group = await this.groupsService.findOne(manager.groupId);
            if (group?.permissions) {
                try {
                    permissions = JSON.parse(group.permissions);
                }
                catch { }
            }
        }
        const payload = {
            email: manager.username,
            sub: manager.id,
            type: 'manager',
            name: manager.name,
            permissions,
        };
        return { access_token: this.jwtService.sign(payload) };
    }
    async register(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async getProfile(reqUser) {
        if (reqUser?.type === 'manager') {
            const manager = await this.managersService.findOne(reqUser.managerId);
            if (!manager)
                throw new common_1.UnauthorizedException();
            let permissions = [];
            let dashboardLayout = null;
            if (manager.groupId) {
                const securityGroup = await this.groupsService.findOne(manager.groupId);
                if (securityGroup) {
                    if (securityGroup.permissions) {
                        try {
                            permissions = JSON.parse(securityGroup.permissions);
                        }
                        catch { }
                    }
                    if (securityGroup.dashboardId) {
                        const dashboardGroup = await this.groupsService.findOne(securityGroup.dashboardId);
                        if (dashboardGroup?.layout) {
                            dashboardLayout = dashboardGroup.layout;
                        }
                    }
                }
            }
            return {
                id: manager.id,
                name: manager.name,
                email: manager.username,
                roles: [],
                employee: null,
                permissions,
                type: 'manager',
                managerId: manager.id,
                groupId: manager.groupId,
                dashboardLayout,
            };
        }
        const user = await this.usersService.findOne(reqUser.userId);
        if (!user)
            throw new common_1.UnauthorizedException();
        const employee = await this.employeesService.findByUsername(user.email);
        const isSuperAdmin = user.roles?.some(r => r.name === 'Super Admin');
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles?.map(r => ({ id: r.id, name: r.name })) || [],
            employee: employee ? {
                id: employee.id,
                name: employee.name,
                department: employee.department ? {
                    id: employee.department.id,
                    name: employee.department.name,
                    permissions: employee.department.permissions || [],
                } : null,
            } : null,
            permissions: isSuperAdmin ? ['*'] : (employee?.department?.permissions || []),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        employees_service_1.EmployeesService,
        managers_service_1.ManagersService,
        groups_service_1.GroupsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map