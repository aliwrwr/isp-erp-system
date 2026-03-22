import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EmployeesService } from '../../employees/employees.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private employeesService: EmployeesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: any) {
    // Manager token — permissions are embedded in the JWT to avoid extra DB round-trip
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

    // Regular user token
    const user = await this.usersService.findOne(payload.sub);
    if (!user) return null;
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
}
