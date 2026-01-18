import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';

/**
 * @description Estrategia de Validación JWT (Blueprint 2026).
 * Se encarga de decodificar el token, verificar su firma y transformar el payload 
 * en una entidad de usuario hidratada con datos frescos de la base de datos.
 * * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    
    if (!secret) {
      throw new Error('CONFIG_ERROR: JWT_ACCESS_SECRET no definido en el entorno.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Blueprint 2026: Nunca ignorar expiración en producción
      secretOrKey: secret,
    });
  }

/**
 * @description Estrategia de Validación JWT (Refactorizada Rentix 2026).
 * Garantiza que el objeto 'request.user' tenga las propiedades normalizadas.
 */
async validate(payload: any): Promise<any> {
  const { sub: id, companyId, companyRole } = payload;

  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException('SEGURIDAD: Identidad no válida o inactiva.');
  }

  /**
   * Normalización del objeto User (Mapping DB -> App)
   * Extraemos app_role de la DB y lo exponemos como appRole para los decoradores.
   */
  return {
    ...user,
    id: user.id, // Aseguramos que 'id' esté disponible si se usa 'sub' en el token
    appRole: user.appRole, // 🚩 CLAVE: Mapeo explícito para @GetUser('appRole')
    companyId,
    companyRole,
  };
}
}