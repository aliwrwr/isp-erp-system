import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private employeesService: EmployeesService,
  ) {}

  async validateUser(emailOrUsername: string, pass: string): Promise<any> {
    // Try finding by email first, then treat input as username
    let user = await this.usersService.findByEmail(emailOrUsername);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user.id, roles: user.roles.map(role => role.name) };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException();

    // Find linked employee by username (email in users table = username in employees table)
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
