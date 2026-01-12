import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// Importamos la clave y el tipo de unión desde el decorador (misma carpeta superior)
import { ROLES_KEY, AllowedRoles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtenemos los roles permitidos (ahora tipado con AllowedRoles)
    const requiredRoles = this.reflector.getAllAndOverride<AllowedRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (rolesArray.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Validación: El usuario debe estar autenticado (inyectado por JwtStrategy)
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    /**
     * Comprobación Maestra:
     * El usuario accede si su appRole O su companyRole coincide con lo requerido
     */
    const hasRole = rolesArray.some((role) => 
      role === user.appRole || role === user.companyRole
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso insuficiente. Perfil actual: [App: ${user.appRole}, Company: ${user.companyRole}]`
      );
    }

    return true;
  }
}