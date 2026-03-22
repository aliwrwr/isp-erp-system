import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { EmployeesService } from '../employees/employees.service';
import { ManagersService } from '../managers/managers.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private employeesService: EmployeesService,
    private managersService: ManagersService,
    private groupsService: GroupsService,
  ) {}

  async validateUser(emailOrUsername: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(emailOrUsername);
    if (!user) return null;
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) return null;
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    // 1. Try system users first
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user) {
      const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordMatch) throw new UnauthorizedException('كلمة المرور غير صحيحة');
      const payload = { email: user.email, sub: user.id, type: 'user', roles: user.roles.map(r => r.name) };
      return { access_token: this.jwtService.sign(payload) };
    }

    // 2. Try managers table
    const manager = await this.managersService.findByUsername(loginDto.email);
    if (!manager) throw new UnauthorizedException('اسم الدخول غير مسجل في النظام');
    if (!manager.password) throw new UnauthorizedException('كلمة المرور غير محددة لهذا الحساب');

    const passwordMatch = await bcrypt.compare(loginDto.password, manager.password);
    if (!passwordMatch) throw new UnauthorizedException('كلمة المرور غير صحيحة');

    // Resolve group permissions
    let permissions: string[] = [];
    if (manager.groupId) {
      const group = await this.groupsService.findOne(manager.groupId);
      if (group?.permissions) {
        try { permissions = JSON.parse(group.permissions); } catch { /* ignore */ }
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

  async register(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  async getProfile(reqUser: any) {
    // Manager login
    if (reqUser?.type === 'manager') {
      const manager = await this.managersService.findOne(reqUser.managerId);
      if (!manager) throw new UnauthorizedException();
      let permissions: string[] = [];
      if (manager.groupId) {
        const group = await this.groupsService.findOne(manager.groupId);
        if (group?.permissions) {
          try { permissions = JSON.parse(group.permissions); } catch { /* ignore */ }
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
      };
    }

    // Regular user login
    const user = await this.usersService.findOne(reqUser.userId);
    if (!user) throw new UnauthorizedException();

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
}
