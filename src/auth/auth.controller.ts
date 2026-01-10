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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { LoginDto, TokensDto } from './dto';
import { User } from 'src/user/entities/user.entity';
import { User as UserDecorator } from './decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔑 LOGIN
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'Login correcto',
    type: TokensDto,
  })
  async login(
    @Body() _loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<TokensDto> {
    // LocalAuthGuard garantiza req.user
    return this.authService.login(req.user as User);
  }

  // ♻️ REFRESH TOKEN
  @Post('refresh')
  @ApiOperation({
    summary: 'Generar un nuevo access token usando refresh token',
  })
  @ApiBody({
    type: Object,
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiCreatedResponse({
    description: 'Tokens renovados correctamente',
    type: TokensDto,
  })
  async refresh(
    @Body() body: { refreshToken: string },
  ): Promise<TokensDto> {
    return this.authService.refresh(body.refreshToken);
  }

  // 🚪 LOGOUT
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cerrar sesión e invalidar refresh token',
  })
  @ApiOkResponse({
    description: 'Logout correcto',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logout correcto',
        },
      },
    },
  })
  async logout(
    @UserDecorator() user: { id: string },
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: 'Logout correcto' };
  }
}
