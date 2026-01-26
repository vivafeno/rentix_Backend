import { Controller, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';

import { AuthService, AuthSession } from './auth.service'; // Inyectamos la nueva interfaz
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

import { User } from '../user/entities/user.entity'; 
import { SelectCompanyDto, RefreshTokenDto, LoginDto } from './dto';

/**
 * @class AuthController
 * @description Controlador de Identidad y Acceso.
 * Gestiona el ciclo de vida de la sesión bajo el estándar Rentix 2026.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @method login
   * @description Emite la sesión inicial (User + Context + Tokens).
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login con credenciales locales' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ 
    description: 'Sesión iniciada con éxito. Datos listos para Signals.',
    // Nota: Swagger mostrará el esquema de AuthSession
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales incorrectas o usuario inactivo.' })
  async login(@GetUser() user: User): Promise<AuthSession> {
    // El AuthService ya devuelve AuthSession, ahora el controlador lo reconoce
    return this.authService.login(user);
  }

  /**
   * @method selectCompany
   * @description Realiza el Tenant Switch y refresca el estado de la sesión.
   */
  @UseGuards(JwtAuthGuard)
  @Post('select-company')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contexto de empresa (Tenant Switch)' })
  @ApiOkResponse({ 
    description: 'Sesión actualizada para la nueva empresa seleccionada.'
  })
  async selectCompany(
    @GetUser('id') userId: string, 
    @Body() dto: SelectCompanyDto
  ): Promise<AuthSession> {
    return this.authService.selectCompany(userId, dto.companyId);
  }

  /**
   * @method refresh
   * @description Rotación de tokens con refresco de perfil de usuario.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotación de Tokens (Refresh)' })
  @ApiOkResponse({ 
    description: 'Sesión renovada exitosamente.'
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthSession> {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * @method logout
   * @description Invalida la sesión actual.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión (Invalidar Tokens)' })
  @ApiOkResponse({ 
    schema: { 
      type: 'object', 
      properties: { 
        message: { type: 'string', example: 'Sesión cerrada correctamente.' } 
      } 
    } 
  })
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Sesión cerrada correctamente.' };
  }
}