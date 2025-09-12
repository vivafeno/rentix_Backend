import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    // Validar email y contraseña
    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    // Generar access y refresh tokens
    async login(user: any): Promise<TokensDto> {
        const payload = { sub: user.id, email: user.email, roles: user.roles };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });

        // Guardar hash del refresh en DB
        await this.usersService.updateRefreshToken(
            user.id,
            await bcrypt.hash(refreshToken, 10),
        );

        return { accessToken, refreshToken };
    }

    // Refrescar access token
    async refresh(refreshToken: string): Promise<TokensDto> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const user = await this.usersService.findById(payload.sub);

            if (!user || !user.refreshTokenHash) {
                throw new UnauthorizedException('No refresh token stored');
            }

            const isValid = await bcrypt.compare(
                refreshToken,
                user.refreshTokenHash,
            );
            if (!isValid) throw new UnauthorizedException('Invalid refresh token');

            return this.login(user);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    // Logout → invalida refresh token
    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
        return { message: 'Logged out' };
    }
}
