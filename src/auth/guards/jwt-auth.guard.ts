import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActiveUserData } from '../interfaces/jwt-payload.interface';

/**
 * @class JwtAuthGuard
 * @description Guard de Autenticación JWT (Blueprint 2026).
 * Valida la autenticidad y vigencia del token Bearer.
 * @version 2026.1.19
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * @method canActivate
   * @description Determina si se permite el acceso.
   * Se elimina Observable para cumplir con la prohibición de RXJS.
   */
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  /**
   * @method handleRequest
   * @description Procesa el resultado de la estrategia JWT.
   * Tipado estricto para eliminar errores de 'any' access.
   */
  override handleRequest<TUser = ActiveUserData>(
    err: unknown,
    user: TUser | null,
    info: unknown,
  ): TUser {
    // 🚩 Solución error 40: Validación de tipo para 'info' antes de acceder a .name
    const errorInfo = info as { name?: string } | undefined;

    if (err || !user) {
      if (errorInfo?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'La sesión ha expirado. Por favor, inicie sesión de nuevo.',
        );
      }

      throw new UnauthorizedException(
        'Acceso no autorizado: Token inválido o inexistente.',
      );
    }

    // 🚩 Solución error 52: Retorno tipado que evita 'any'
    return user;
  }
}
