import { applyDecorators, UseGuards } from '@nestjs/common';
import { AppRole } from '../enums/user-global-role.enum';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth(...roles: AppRole[]) {
  return applyDecorators(
    Roles(...roles), // 1. Define qué roles pueden entrar
    UseGuards(JwtAuthGuard, RolesGuard), // 2. Activa la seguridad JWT y de Roles
    ApiBearerAuth(), // 3. Documentación en Swagger (candadito)
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
