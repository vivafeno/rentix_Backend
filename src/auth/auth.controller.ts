import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { TokensDto } from './dto/tokens.dto';
import { Request } from 'express';
import { User } from './decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔑 LOGIN
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  @ApiResponse({ status: 201, description: 'Login correcto', type: TokensDto })
  async login(@Body() _loginDto: LoginDto, @Req() req) {
    // LocalAuthGuard ya valida el usuario y lo inyecta en req.user
    return this.authService.login(req.user);
  }

  // ♻️ REFRESH TOKEN
  @Post('refresh')
  @ApiOperation({ summary: 'Generar un nuevo access token usando refresh' })
  @ApiResponse({ status: 201, description: 'Tokens renovados', type: TokensDto })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  // 🚪 LOGOUT
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión e invalidar refresh token' })
  @ApiResponse({ status: 200, description: 'Logout correcto' })
  async logout(@User('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
