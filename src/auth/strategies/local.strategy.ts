import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * @method validate
   * @description Validación con protección contra ataques de temporización.
   */
  async validate(email: string, password: string): Promise<User> {
    // 🛡️ Rigor 2026: El AuthService debe manejar el hashing y la comparación.
    const user = await this.authService.validateUser(email, password);

    // 🚩 Punto de Seguridad:
    // Si validateUser falló, lanzamos una excepción opaca. 
    // Es vital que el tiempo que tarda el servidor sea similar 
    // tanto si el usuario existe como si no.
    if (!user) {
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    // 🔒 Verificación de Estado: 
    // Aunque ya se valide en el servicio, re-confirmamos aquí
    // que la cuenta no esté suspendida o pendiente de borrado (Soft Delete).
    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta se encuentra inactiva.');
    }

    return user;
  }
}