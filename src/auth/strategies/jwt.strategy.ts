import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity'; // 👈 Asegura la ruta a tu entidad User

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<any> {
    const { sub: id, companyId, companyRole } = payload; // 'sub' es el estándar para el ID en JWT

    // 1. Buscamos al usuario en la base de datos en tiempo real
    const user = await this.userRepository.findOne({
      where: { id },
      // Aseguramos traer el appRole y el estado activo
      // (TypeORM trae todo por defecto salvo que uses select: false en la entidad)
    });

    // 2. Si no existe o está inactivo, rechazamos la petición aunque tenga token
    if (!user) {
      throw new UnauthorizedException('Token no válido: Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Devolvemos el usuario REAL de la DB. 
    // Ahora user.appRole será 'SUPERADMIN' porque lo lee de Postgres, no del Token viejo.
    return {
      ...user,
      companyId,
      companyRole,
    };
  }
}