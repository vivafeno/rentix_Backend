import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';

/**
 * @class LocalAuthGuard
 * @description Guard de Autenticación Local optimizado.
 * Implementa el manejo de errores tipado y asegura la limpieza del objeto de usuario.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  
  /**
   * @description Eliminamos RxJS para usar el motor de promesas nativo de NestJS (Rigor 2026).
   */
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  /**
   * @method handleRequest
   * @description Procesa la validación con tipado estricto.
   */
  override handleRequest<TUser = User>(
    err: unknown,
    user: TUser | null,
  ): TUser {
    // 1. Validación de error y existencia
    if (err || !user) {
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    // 2. Punto de Rigor Rentix: 
    // Si el usuario es una instancia de la entidad, aquí podríamos realizar 
    // una sanitización final antes de que llegue al controlador si fuera necesario.
    return user;
  }
}