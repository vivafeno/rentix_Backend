import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TenantProfileService } from './tenant-profile.service';
import { CreateTenantProfileDto } from './dto/create-tenant-profile.dto';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import type { ActiveUserData } from 'src/auth/interfaces/jwt-payload.interface';

/**
 * @class TenantProfileController
 * @description Gestión de perfiles de clientes y arrendatarios (CRM).
 * Implementa validación de contexto multi-tenant obligatoria para todas las operaciones.
 * @version 2026.1.19
 */
@ApiTags('Tenant Profiles (CRM)')
@ApiBearerAuth()
@Controller('client-profiles')
export class TenantProfileController {
  constructor(private readonly clientProfileService: TenantProfileService) {}

  /**
   * @method create
   * @description Registra un nuevo perfil bajo el contexto de la empresa activa.
   * Resuelve errores 41 y 47 mediante el uso de ActiveUserData.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({
    summary: 'Crear cliente',
    description:
      'Crea un cliente CRM + Identidad Fiscal + Dirección Fiscal en una sola operación.',
  })
  @ApiResponse({ status: 201, description: 'Cliente creado correctamente.' })
  create(
    @Body() createDto: CreateTenantProfileDto,
    @GetUser() user: ActiveUserData, // 🚩 Solución: Tipado estricto en lugar de any
  ) {
    const companyId = user.companyId;

    if (!companyId) {
      throw new BadRequestException(
        'No has seleccionado ninguna empresa. Usa el contexto patrimonial para operar.',
      );
    }

    return this.clientProfileService.create(companyId, createDto);
  }

  /**
   * @method findAll
   * @description Lista clientes filtrados por el ID de empresa del token.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar clientes de mi empresa' })
  findAll(@GetUser('companyId') companyId: string) {
    return this.clientProfileService.findAll(companyId);
  }

  /**
   * @method findOne
   * @description Detalle de cliente con validación de pertenencia.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.findOne(id, companyId);
  }

  /**
   * @method update
   * @description Actualización parcial de datos del cliente.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar datos CRM del cliente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTenantProfileDto,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.update(id, companyId, updateDto);
  }

  /**
   * @method remove
   * @description Desactivación lógica restringida a roles de gestión.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar cliente (Soft delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.remove(id, companyId);
  }
}
