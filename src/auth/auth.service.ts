import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { TokensDto } from './dto/tokens.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validación usada por LocalStrategy
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Login → genera access + refresh token
   */
  async login(user: User): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      appRole: user.appRole,
    };

    // Access token (configurado en JwtModule)
    const accessToken = await this.jwtService.signAsync(payload);

    // Refresh token (secret y expiración independientes)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(
      user.id,
      await bcrypt.hash(refreshToken, 10),
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh token → emite nuevos tokens
   */
  async refresh(refreshToken: string): Promise<TokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout → invalida refresh token
   * (el controller decide qué respuesta enviar)
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
