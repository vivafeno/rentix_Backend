import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no se definió rol → acceso libre
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.globalRole) {
      throw new ForbiddenException('Usuario no autenticado o sin rol');
    }

    if (!requiredRoles.includes(user.globalRole)) {
      throw new ForbiddenException(
        `Acceso denegado para el rol ${user.globalRole}`,
      );
    }

    return true;
  }
}
