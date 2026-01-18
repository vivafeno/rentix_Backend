import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

/**
 * @description Estrategia de Autenticación Local (Blueprint 2026).
 * Valida la identidad del usuario mediante credenciales tradicionales (email/password).
 * Configurada para utilizar el campo 'email' como identificador único de usuario.
 * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  
  /**
   * @description Configura la estrategia para mapear 'email' como el campo de usuario.
   * @param authService Servicio de autenticación para validación de lógica de negocio.
   */
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * @description Método de validación interna de Passport para credenciales locales.
   * Delega la lógica de comparación de hash y búsqueda en DB al AuthService.
   * * @param email Correo electrónico proporcionado en el login.
   * @param password Contraseña proporcionada en el login.
   * @returns {Promise<Partial<User>>} Retorna el perfil del usuario si la validación es exitosa.
   * @throws {UnauthorizedException} Si el par usuario/contraseña no es válido.
   */
  async validate(email: string, password: string): Promise<Partial<User>> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      // Mensaje genérico por seguridad (Blueprint 2026: No revelar existencia de cuentas)
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    return user;
  }
}