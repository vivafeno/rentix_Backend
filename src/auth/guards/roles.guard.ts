import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AllowedRoles } from '../decorators/roles.decorator';

/**
 * @description Guard de Autorización Jerárquica (Blueprint 2026).
 * Valida el acceso basado en una doble comprobación: 
 * 1. Roles de Aplicación (SUPERADMIN, ADMIN) - Alcance Global.
 * 2. Roles de Empresa (OWNER, TENANT, VIEWER) - Alcance de Contexto.
 * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * @description Determina si la petición actual cumple con los requisitos de rol.
   * @param context Contexto de ejecución de NestJS
   * @returns {boolean} True si el acceso es concedido
   * @throws {UnauthorizedException} Si el usuario no existe en la request
   * @throws {ForbiddenException} Si los roles no coinciden con los requeridos
   */
  canActivate(context: ExecutionContext): boolean {
    // 1. Extracción de Metadatos (Roles definidos en el decorador @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<AllowedRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos, el endpoint es de libre acceso para usuarios autenticados
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Extracción de Usuario desde la Request (Inyectado por JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Identidad de usuario no verificada en el contexto');
    }

    /**
     * @description COMPROBACIÓN MAESTRA DE ROLES (Blueprint 2026)
     * Un usuario tiene acceso si:
     * - Su rol global (appRole) está en la lista permitida.
     * - O su rol de contexto (companyRole) está en la lista permitida.
     */
    const hasAccess = requiredRoles.some((role) => {
      const isAppRole = user.appRole === role;
      const isCompanyRole = user.companyRole === role;
      
      return isAppRole || isCompanyRole;
    });

    if (!hasAccess) {
      throw new ForbiddenException({
        message: 'Blindaje Total: Acceso denegado por jerarquía insuficiente.',
        required: requiredRoles,
        current: {
          app: user.appRole,
          company: user.companyRole || 'NONE'
        }
      });
    }

    return true;
  }
}