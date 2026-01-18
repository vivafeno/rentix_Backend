import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * @description Guard de Autenticación JWT (Blueprint 2026).
 * Valida la autenticidad y vigencia del token Bearer enviado en las cabeceras.
 * Actúa como la primera capa de blindaje antes de las comprobaciones de roles o contexto.
 * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  /**
   * @description Determina si se permite el acceso basándose en la validación del JWT.
   * @param context Contexto de ejecución de NestJS
   */
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Aquí se podrían añadir lógicas de exclusión de rutas si fuera necesario
    return super.canActivate(context);
  }

  /**
   * @description Procesa el resultado de la estrategia JWT (JwtStrategy).
   * Personaliza la respuesta en caso de tokens expirados o malformados para el Frontend.
   * * @param err Error capturado por Passport
   * @param user Usuario decodificado desde el payload del JWT
   * @param info Información adicional del error (ej. JsonWebTokenError)
   * @throws {UnauthorizedException} Si el token es inválido o no existe
   */
  override handleRequest(err: any, user: any, info: any) {
    // Si hay un error o el usuario no existe, lanzamos excepción de seguridad
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('La sesión ha expirado. Por favor, inicie sesión de nuevo.');
      }
      
      throw new UnauthorizedException(
        'Acceso no autorizado: Token inválido o inexistente.'
      );
    }

    // El objeto 'user' aquí inyectado será el que utilicen los Controllers y otros Guards
    return user;
  }
}