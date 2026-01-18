import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @description Guard de Autenticación Local (Blueprint 2026).
 * Actúa como disparador de la 'LocalStrategy' para validar credenciales primarias (email/password).
 * Se utiliza exclusivamente en el endpoint de Login inicial.
 * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  
  /**
   * @description Maneja el resultado de la validación de la estrategia local.
   * Personaliza la respuesta de error para no revelar detalles sensibles sobre la existencia de cuentas.
   * * @param err Error capturado por Passport
   * @param user Usuario validado por la estrategia
   * @returns El usuario validado
   * @throws {UnauthorizedException} Si las credenciales son incorrectas
   */
  override handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Credenciales de acceso no válidas.');
    }
    return user;
  }
}