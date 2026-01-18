import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';

/**
 * @class LocalAuthGuard
 * @description Guard de Autenticación Local (Blueprint 2026).
 * Actúa como disparador de la 'LocalStrategy' para validar credenciales primarias.
 * @version 2026.1.19
 * @author Rentix
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * @method handleRequest
   * @description Maneja el resultado de la validación de la estrategia local con tipado estricto.
   * Resuelve el error 27 de linter al eliminar el retorno de tipo 'any'.
   * @param {unknown} err Error capturado por Passport
   * @param {User | null} user Usuario validado por la estrategia
   * @returns {User} El usuario validado si la autenticación es exitosa
   * @throws {UnauthorizedException} Si las credenciales son incorrectas
   */
  override handleRequest<TUser = User>(
    err: unknown,
    user: TUser | null,
  ): TUser {
    if (err || !user) {
      // 🛡️ Blindaje de información: Mensaje genérico para evitar enumeración de cuentas
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    // Al tipar TUser como genérico restringido por la llamada, eliminamos el error de unsafe return
    return user;
  }
}
