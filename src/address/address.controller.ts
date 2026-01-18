import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class AddressController
 * @description Orquestador de direcciones postales y fiscales (Rentix 2026).
 * Gestiona el ciclo de vida desde el estado DRAFT (Wizard) hasta la vinculación patrimonial.
 * @author Rentix 2026
 * @version 2.3.0
 */
@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /* ------------------------------------------------------------------
   * FLUJO WIZARD (HYDRATED DRAFTS)
   * ------------------------------------------------------------------ */

  /**
   * @method createDraft
   * @description Inicia la persistencia de una dirección en estado DRAFT.
   * Parte del patrón de creación atómica: se crea antes que la empresa.
   * @param {CreateAddressDto} dto - Datos normalizados (direccion, poblacion, etc.)
   * @param {string} userId - ID del usuario en sesión.
   * @returns {Promise<Address>} Registro temporal persistido.
   */
  @Post('draft')
  @Auth()
  @ApiOperation({ 
    summary: 'Crear dirección temporal (Paso del Wizard)', 
    description: 'Crea una dirección en estado DRAFT vinculada al creador para posterior hidratación.'
  })
  @ApiCreatedResponse({ type: Address })
  async createDraft(
    @Body() dto: CreateAddressDto,
    @GetUser('id') userId: string
  ): Promise<Address> {
    return this.addressService.createDraft(dto, userId);
  }

  /**
   * @method findDraft
   * @description Recupera un borrador activo. Valida que el solicitante sea el creador.
   */
  @Get('draft/:id')
  @Auth()
  @ApiOperation({ summary: 'Recuperar un borrador por ID' })
  @ApiOkResponse({ type: Address })
  async findDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string
  ): Promise<Address> {
    return this.addressService.findDraft(id, userId);
  }

  /**
   * @method updateDraft
   * @description Permite la edición de datos en caliente durante el flujo del Wizard.
   */
  @Patch('draft/:id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar borrador durante el wizard' })
  @ApiOkResponse({ type: Address })
  async updateDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @GetUser('id') userId: string
  ): Promise<Address> {
    return this.addressService.updateDraft(id, dto, userId);
  }

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
    description: 'Aplica aislamiento por contexto de empresa y validación de roles.'
  })
  @ApiOkResponse({ type: [Address] })
  async findAllForCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<Address[]> {
    return this.addressService.findAllForCompany(companyId, userId, appRole, {
      includeInactive: includeInactive === 'true',
    });
  }

  /**
   * @method remove
   * @description Ejecuta una baja lógica (Soft Delete) de la dirección.
   * Veri*factu: Los registros no se eliminan físicamente para mantener trazabilidad fiscal.
   */
  @Delete('/company/:companyId/:addressId')
  @Auth()
  @ApiOperation({ summary: 'Desactivar dirección de empresa' })
  @ApiOkResponse({ description: 'Dirección marcada como inactiva (ARCHIVED).' })
  async remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<{ message: string }> {
    await this.addressService.softDeleteForCompany(companyId, addressId, userId, appRole);
    return { message: 'Dirección desactivada correctamente' };
  }
}