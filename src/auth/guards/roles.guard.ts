import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppRole } from '../../auth/enums/user-global-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; 
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ✅ CORRECCIÓN: Usar 'appRole' que es lo que viene en el JWT
    if (!user || !user.appRole) {
      throw new ForbiddenException('Usuario no autenticado o sin rol asignado');
    }

    // ✅ CORRECCIÓN: Comparación con la propiedad correcta
    const hasRole = requiredRoles.includes(user.appRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Tu rol (${user.appRole}) no tiene permisos para acceder a este recurso`,
      );
    }

    return true;
  }
}