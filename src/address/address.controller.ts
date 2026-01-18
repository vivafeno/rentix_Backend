import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { AddressService } from './address.service';
import { Address } from './entities/address.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class AddressController
 * @description Orquestador de direcciones consolidadas (Rentix 2026).
 * Gestiona el inventario activo y archivado bajo aislamiento multi-tenant.
 * @author Rentix 2026
 * @version 2.3.1
 */
@ApiTags('Addresses')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autenticado.' })
@ApiForbiddenResponse({ description: 'Permisos insuficientes.' })
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /* ------------------------------------------------------------------
   * FLUJO GESTIÓN PATRIMONIAL (TENANT ISOLATION)
   * ------------------------------------------------------------------ */

  /**
   * @method findAllForCompany
   * @description Recupera el histórico de direcciones de una empresa.
   * Implementa seguridad por jerarquía de roles y bypass para SUPERADMIN.
   */
  @Get('/company/:companyId')
  @Auth()
  @ApiOperation({
    summary: 'Listar direcciones de una empresa',
    description:
      'Aplica aislamiento por contexto de empresa y validación de roles.',
  })
  @ApiOkResponse({ type: [Address] })
  async findAllForCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole, // 🛡️ Tipado estricto
    @Query('includeInactive') includeInactive?: string,
  ): Promise<Address[]> {
    // 🛡️ Casting 'as AppRole' para asegurar compatibilidad con el servicio
    return await this.addressService.findAllForCompany(
      companyId,
      userId,
      appRole,
      { includeInactive: includeInactive === 'true' },
    );
  }

  /**
   * @method remove
   * @description Ejecuta una baja lógica (Soft Delete) de la dirección.
   * Veri*factu: Los registros no se eliminan físicamente.
   */
  @Delete('/company/:companyId/:addressId')
  @Auth()
  @ApiOperation({ summary: 'Desactivar dirección de empresa' })
  @ApiOkResponse({ description: 'Dirección marcada como inactiva (ARCHIVED).' })
  async remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole, // 🛡️ Tipado estricto
  ): Promise<{ message: string }> {
    await this.addressService.softDeleteForCompany(
      companyId,
      addressId,
      userId,
      appRole,
    );
    return { message: 'Dirección desactivada correctamente' };
  }
}
