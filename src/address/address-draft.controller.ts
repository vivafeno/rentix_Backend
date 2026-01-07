import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
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

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

/**
 * Controller para direcciones en borrador (DRAFT)
 *
 * ⚠️ NO pertenecen a una empresa todavía
 * ⚠️ Usado en flujos tipo wizard
 */
@ApiTags('addresses-draft')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserGlobalRole.SUPERADMIN,
  UserGlobalRole.ADMIN,
  UserGlobalRole.USER,
)
@Controller('addresses/drafts')
export class AddressDraftController {
  constructor(
    private readonly addressDraftService: AddressDraftService,
  ) {}

  // ─────────────────────────────────────
  // Crear dirección en borrador
  // ─────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear dirección en borrador',
    description:
      'Crea una dirección sin asociar a empresa (estado DRAFT).',
  })
  @ApiBody({ type: CreateAddressDto })
  @ApiCreatedResponse({
    description: 'Dirección creada en borrador',
    type: Address,
  })
  createDraft(
    @Body() dto: CreateAddressDto,
  ): Promise<Address> {
    return this.addressDraftService.createDraft(dto);
  }

  // ─────────────────────────────────────
  // Obtener dirección draft
  // ─────────────────────────────────────
  @Get(':addressId')
  @ApiOperation({
    summary: 'Obtener una dirección en borrador',
  })
  @ApiParam({
    name: 'addressId',
    description: 'UUID de la dirección',
  })
  @ApiOkResponse({
    description: 'Dirección en borrador',
    type: Address,
  })
  findDraft(
    @Param('addressId') addressId: string,
  ): Promise<Address> {
    return this.addressDraftService.findDraftById(addressId);
  }

  // ─────────────────────────────────────
  // Actualizar dirección draft
  // ─────────────────────────────────────
  @Patch(':addressId')
  @ApiOperation({
    summary: 'Actualizar dirección en borrador',
  })
  @ApiParam({
    name: 'addressId',
    description: 'UUID de la dirección',
  })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({
    description: 'Dirección actualizada',
    type: Address,
  })
  updateDraft(
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<Address> {
    return this.addressDraftService.updateDraft(addressId, dto);
  }

  // ─────────────────────────────────────
  // Asociar dirección draft a empresa
  // ─────────────────────────────────────
  @Post(':addressId/attach/company/:companyId')
  @ApiOperation({
    summary: 'Asociar dirección en borrador a una empresa',
    description:
      'Convierte la dirección DRAFT en ACTIVE y la asocia a la empresa indicada.',
  })
  @ApiParam({
    name: 'addressId',
    description: 'UUID de la dirección',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiOkResponse({
    description: 'Dirección asociada a empresa',
    type: Address,
  })
  attachToCompany(
    @Param('addressId') addressId: string,
    @Param('companyId') companyId: string,
  ): Promise<Address> {
    return this.addressDraftService.attachToCompany(
      addressId,
      companyId,
    );
  }
}
