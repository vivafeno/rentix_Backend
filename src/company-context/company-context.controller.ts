import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

// Guards & Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { AppRole } from '../auth/enums/user-global-role.enum';

// Service & DTO
import { CompanyContextService } from './company-context.service';
import { SelectCompanyDto } from '../auth/dto';
import { TokensDto } from '../auth/dto/tokens.dto';

/**
 * @description Controlador de Gestión de Contexto Operativo (Blueprint 2026).
 * Permite al usuario conmutar entre los diferentes patrimonios a los que tiene acceso.
 * * @author Rentix
 * @version 2026.1.18
 */
@ApiTags('context')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('context')
export class CompanyContextController {
  constructor(private readonly companyContextService: CompanyContextService) {}

  /**
   * @description Selecciona una empresa activa y emite un nuevo JWT con claims de contexto.
   * Este endpoint es el puente entre la identidad global y la gestión de activos.
   * * @param userId UUID del usuario (extraído del Access Token actual)
   * @param dto Contiene el companyId seleccionado
   * @returns {Promise<TokensDto>} Nuevos tokens Access y Refresh con contexto de empresa
   */
  @Post('select-company')
  @HttpCode(HttpStatus.OK)
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Elección de patrimonio operativo' })
  @ApiOkResponse({ 
    description: 'Contexto actualizado. Se emite nuevo token con companyId y companyRole.',
    type: TokensDto 
  })
  async selectCompany(
    @UserDecorator('id') userId: string,
    @Body() dto: SelectCompanyDto,
  ): Promise<TokensDto> {
    // Blueprint 2026: Delegación de lógica de blindaje al servicio
    return this.companyContextService.selectCompany(userId, dto);
  }
}