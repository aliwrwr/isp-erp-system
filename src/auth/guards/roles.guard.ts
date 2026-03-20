import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No restrictions at all
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Super Admin always passes
    if (user.isSuperAdmin) return true;

    // Check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) =>
        user.roles?.some((userRole) => userRole.name === role),
      );
      if (hasRole) return true;
    }

    // Check department permissions
    // Supports both exact match ('internet.subscribers')
    // and prefix match ('internet.subscribers.create' satisfies 'internet.subscribers')
    if (requiredPermissions) {
      const userPerms: string[] = user.permissions ?? [];
      const hasPerm = requiredPermissions.some((perm) =>
        userPerms.some((up) => up === perm || up.startsWith(perm + '.')),
      );
      if (hasPerm) return true;
    }

    return false;
  }
}
