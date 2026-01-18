import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { LoginDto, TokensDto, SelectCompanyDto} from './dto';
import { User } from '../user/entities/user.entity';
import { User as UserDecorator } from './decorators/user.decorator';

/**
 * @description Controlador de Autenticación y Gestión de Contexto (Blueprint 2026).
 * Orquesta el acceso inicial, la renovación de identidad y el cambio de contexto operativo.
 * * @author Rentix
 * @version 2026.1.18
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Autenticación primaria mediante credenciales.
   * LocalAuthGuard valida contra la base de datos y adjunta el usuario a la request.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Login con email y password' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'Identidad verificada, tokens emitidos.',
    type: TokensDto,
  })
  async login(
    @Body() _loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<TokensDto> {
    // Blueprint 2026: Delegación directa al servicio con el usuario validado
    return this.authService.login(req.user as User);
  }

  /**
   * @description Cambio de Contexto Operativo (Context Overriding).
   * Emite un nuevo set de tokens que incluyen el ID de la empresa seleccionada.
   */
  @UseGuards(JwtAuthGuard)
  @Post('select-company')
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Establecer contexto de empresa activa' })
  @ApiCreatedResponse({
    description: 'Nuevo Access Token con claims de empresa emitido.',
    type: TokensDto,
  })
  async selectCompany(
    @UserDecorator() user: User,
    @Body() selectCompanyDto: SelectCompanyDto,
  ): Promise<TokensDto> {
    // Este es el método que Angular llama para entrar al Dashboard
    return this.authService.selectCompany(user.id, selectCompanyDto.companyId);
  }

  /**
   * @description Rotación de Access Token mediante Refresh Token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rotación de tokens de seguridad' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: { refreshToken: { type: 'string' } },
    },
  })
  @ApiCreatedResponse({
    description: 'Tokens renovados correctamente.',
    type: TokensDto,
  })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<TokensDto> {
    return this.authService.refresh(refreshToken);
  }

  /**
   * @description Cierre de sesión y revocación de tokens.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidación de sesión activa' })
  @ApiOkResponse({ description: 'Sesión cerrada correctamente.' })
  async logout(
    @UserDecorator() user: { id: string },
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: 'Logout correcto' };
  }
}