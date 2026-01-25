import { Controller, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

// Imports verificados contra nackend.txt
import { User } from '../user/entities/user.entity'; 
import { TokensDto, SelectCompanyDto, RefreshTokenDto, LoginDto } from './dto';

/**
 * @class AuthController
 * @description Controlador principal de Identidad y Acceso.
 * Gestiona el ciclo de vida de los JWT (Emisión, Rotación, Revocación) y el contexto de Tenant.
 * * @standards Rentix 2026 (Security & Documentation)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @method login
   * @description Autentica credenciales (Email/Pass) y emite par de tokens iniciales.
   * El guard `LocalAuthGuard` valida las credenciales antes de entrar aquí.
   * * @param user Entidad de usuario inyectada por el Guard tras validar.
   * @returns {Promise<TokensDto>} Access Token + Refresh Token.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login con credenciales locales' })
  @ApiBody({ type: LoginDto }) // Documentación para Swagger (aunque el Guard lee el body)
  @ApiOkResponse({ 
    type: TokensDto, 
    description: 'Autenticación exitosa. Tokens emitidos.' 
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales incorrectas o usuario inactivo.' })
  async login(@GetUser() user: User): Promise<TokensDto> {
    return this.authService.login(user);
  }

  /**
   * @method selectCompany
   * @description Realiza el cambio de contexto (Tenant Switch).
   * Emite nuevos tokens firmados específicamente con el `companyId` seleccionado.
   * * @param userId UUID del usuario autenticado (extraído del JWT actual).
   * @param dto Objeto con el ID de la empresa destino.
   * @returns {Promise<TokensDto>} Nuevos tokens con claims actualizados.
   */
  @UseGuards(JwtAuthGuard)
  @Post('select-company')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contexto de empresa (Tenant Switch)' })
  @ApiOkResponse({ 
    type: TokensDto, 
    description: 'Nuevos tokens válidos para el contexto de la empresa seleccionada.'
  })
  async selectCompany(
    @GetUser('id') userId: string, 
    @Body() dto: SelectCompanyDto
  ): Promise<TokensDto> {
    return this.authService.selectCompany(userId, dto.companyId);
  }

  /**
   * @method refresh
   * @description Mecanismo de rotación de tokens (RTR).
   * Genera un nuevo Access Token usando un Refresh Token válido.
   * * @param dto Contiene el Refresh Token actual.
   * @returns {Promise<TokensDto>} Nuevo par de tokens.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotación de Tokens (Refresh)' })
  @ApiOkResponse({ 
    type: TokensDto,
    description: 'Sesión renovada exitosamente.'
  })
  @ApiUnauthorizedResponse({ description: 'Refresh Token inválido, caducado o revocado.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * @method logout
   * @description Finaliza la sesión del usuario.
   * Invalida el Refresh Token en base de datos para prevenir reutilización.
   * * @param userId UUID del usuario.
   * @returns Confirmación de cierre.
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