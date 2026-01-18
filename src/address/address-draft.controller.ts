import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
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
 * @version 2026.2.3
 * @author Rentix 2026
 */
@ApiTags('Addresses Drafts')
@ApiBearerAuth()
@Controller('addresses/drafts')
export class AddressDraftController {
  constructor(private readonly addressDraftService: AddressDraftService) {}

  /**
   * @method createDraft
   * @description Inicia la persistencia de una dirección en estado DRAFT.
   */
  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear dirección en borrador' })
  async createDraft(
    @Body() dto: CreateAddressDto,
    @GetUser('id') userId: string,
  ): Promise<Address> {
    return await this.addressDraftService.createDraft(dto, userId);
  }

  /**
   * @method findDraft
   * @description Recupera un borrador activo validando jerarquía de acceso.
   */
  @Get(':addressId')
  @Auth()
  @ApiOperation({ summary: 'Obtener una dirección en borrador' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección DRAFT.' })
  async findDraft(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Address> {
    return await this.addressDraftService.findDraftById(
      addressId,
      userId,
      appRole,
    );
  }

  /**
   * @method updateDraft
   * @description Actualización incremental de datos del borrador.
   */
  @Patch(':addressId')
  @Auth()
  @ApiOperation({ summary: 'Actualizar dirección en borrador' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección.' })
  async updateDraft(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Address> {
    return await this.addressDraftService.updateDraft(
      addressId,
      dto,
      userId,
      appRole,
    );
  }

  /**
   * @method attachToCompany
   * @description Vincula el borrador a una empresa y lo activa (Cierre de Wizard).
   */
  @Post(':addressId/attach/company/:companyId')
  @Auth()
  @ApiOperation({ summary: 'Asociar dirección en borrador a una empresa' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección.' })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa destino.' })
  async attachToCompany(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Address> {
    return await this.addressDraftService.attachToCompany(
      addressId,
      companyId,
      userId,
      appRole,
    );
  }
}
