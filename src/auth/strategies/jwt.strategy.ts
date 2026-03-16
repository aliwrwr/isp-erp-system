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
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      return null;
    }
    const employee = await this.employeesService.findByUsername(user.email);
    const isSuperAdmin = user.roles?.some(r => r.name === 'Super Admin');
    return {
      userId: user.id,
      username: user.email,
      roles: user.roles,
      isSuperAdmin,
      employeeId: employee?.id || null,
      departmentId: employee?.department?.id || null,
      permissions: isSuperAdmin ? ['*'] : (employee?.department?.permissions || []),
    };
  }
}
