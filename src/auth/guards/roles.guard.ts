import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express'; // 🛡️ Importación para tipado de Request
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { ActiveUserData } from '../interfaces/jwt-payload.interface';
import { AppRole } from '../enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class RolesGuard
 * @description Guard de Autorización Jerárquica basado en Blueprint 2026.
 * Valida el acceso mediante la intersección de Roles Globales (AppRole) y de Empresa (CompanyRole).
 * @version 2026.1.20
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * @method canActivate
   * @description Valida si el usuario posee los roles requeridos.
   * Resuelve errores de linter mediante el tipado de la Request y casting seguro.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      (AppRole | CompanyRole)[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 🛡️ Blindaje de tipos: Tipamos la request para que 'user' sea ActiveUserData y no 'any'
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: ActiveUserData }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Comprobación de acceso comparando con el payload del JWT tipado
    const hasAccess = requiredRoles.some((role) => {
      const isAppRole = user.appRole === (role as AppRole);
      const isCompanyRole = user.companyRole === (role as CompanyRole);
      return isAppRole || isCompanyRole;
    });

    if (!hasAccess) {
      throw new ForbiddenException({
        message: 'Blindaje Total: Acceso denegado por jerarquía insuficiente.',
        required: requiredRoles,
        current: {
          app: user.appRole,
          company: user.companyRole || 'NONE',
        },
      });
    }

    return true;
  }
}
