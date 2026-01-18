import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { AddressDraftService } from './address-draft.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * @class AddressDraftController
 * @description Gestión de direcciones temporales para flujos de Wizard (Hydrated Drafts).
 * Permite la persistencia de datos antes de la formalización del vínculo patrimonial.
 * @author Rentix 2026
 * @version 2026.2.0
 */
@ApiTags('Addresses Drafts')
@ApiBearerAuth()
@Controller('addresses/drafts')
export class AddressDraftController {
  constructor(private readonly addressDraftService: AddressDraftService) {}

  /**
   * @method createDraft
   * @description Crea una dirección en estado DRAFT vinculada al creador.
   * Campo 'direccion' unificado según estándar Veri*factu.
   */
  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Crear dirección en borrador',
    description:
      'Crea una dirección sin asociación empresarial (estado DRAFT) para Wizards.',
  })
  @ApiBody({ type: CreateAddressDto })
  @ApiCreatedResponse({
    description: 'Dirección persistida en estado borrador.',
    type: Address,
  })
  async createDraft(
    @Body() dto: CreateAddressDto,
    @GetUser('id') userId: string,
  ): Promise<Address> {
    return this.addressDraftService.createDraft(dto, userId);
  }

  /**
   * @method findDraft
   * @description Recupera el borrador específico validando la propiedad del usuario.
   */
  @Get(':addressId')
  @Auth()
  @ApiOperation({ summary: 'Obtener una dirección en borrador' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección DRAFT.' })
  @ApiOkResponse({ type: Address })
  async findDraft(
    @Param('addressId') addressId: string,
    @GetUser('id') userId: string,
  ): Promise<Address> {
    return this.addressDraftService.findDraftById(addressId, userId);
  }

  /**
   * @method updateDraft
   * @description Permite la edición parcial del borrador durante los pasos del Wizard.
   */
  @Patch(':addressId')
  @Auth()
  @ApiOperation({ summary: 'Actualizar dirección en borrador' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección.' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({ type: Address })
  async updateDraft(
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
    @GetUser('id') userId: string,
  ): Promise<Address> {
    return this.addressDraftService.updateDraft(addressId, dto, userId);
  }

  /**
   * @method attachToCompany
   * @description Finaliza el Wizard: vincula la dirección a la empresa y activa el estado.
   * Crucial para el cumplimiento Veri*factu al fijar la dirección fiscal.
   */
  @Post(':addressId/attach/company/:companyId')
  @Auth()
  @ApiOperation({
    summary: 'Asociar dirección en borrador a una empresa',
    description:
      'Transiciona el estado de DRAFT a ACTIVE y establece el vínculo patrimonial.',
  })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección.' })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa destino.' })
  @ApiOkResponse({ type: Address })
  async attachToCompany(
    @Param('addressId') addressId: string,
    @Param('companyId') companyId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Address> {
    return this.addressDraftService.attachToCompany(
      addressId,
      companyId,
      userId,
      appRole,
    );
  }
}
