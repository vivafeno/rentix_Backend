import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ActiveUserData } from '../interfaces/jwt-payload.interface';
import { AppRole } from '../enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(AppRole | CompanyRole)[]>(
      ROLES_KEY, 
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: ActiveUserData = request.user;

    if (!user) return false;

    // 🚩 MEJORA 1: Fast-pass para SuperAdmin (Máxima Eficiencia)
    if (user.appRole === AppRole.SUPERADMIN) return true;

    // 🚩 MEJORA 2: Comparación optimizada
    const hasAccess = requiredRoles.some((role) => 
      user.appRole === role || user.companyRole === role
    );

    if (!hasAccess) {
      // 🚩 MEJORA 3: Blindaje de información (Efectividad en Seguridad)
      // No devolvemos los roles requeridos ni los actuales para evitar ingeniería inversa.
      throw new ForbiddenException('Acceso denegado: Jerarquía insuficiente para realizar esta acción.');
    }

    return true;
  }
}