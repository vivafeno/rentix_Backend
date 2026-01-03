import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserGlobalRole } from 'src/user/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string, // 👈 forzamos a string
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, UserGlobalRole: payload.UserGlobalRole as UserGlobalRole };
  }
}
