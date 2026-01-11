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

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // =================================================================
  //  FLUJO WIZARD (DRAFTS)
  // =================================================================

  @Post('draft')
  @Auth() // Cualquier usuario logueado empieza un wizard
  @ApiOperation({ 
    summary: 'Crear dirección temporal (Paso del Wizard)', 
    description: 'Crea una dirección en estado DRAFT vinculada al usuario creador.'
  })
  @ApiCreatedResponse({ type: Address })
  async createDraft(
    @Body() dto: CreateAddressDto,
    @GetUser('id') userId: string
  ) {
    return this.addressService.createDraft(dto, userId);
  }

  @Get('draft/:id')
  @Auth()
  @ApiOperation({ summary: 'Recuperar un borrador por ID' })
  async findDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string // 👈 Seguridad: Solo el dueño la ve
  ) {
    return this.addressService.findDraft(id, userId);
  }

  @Patch('draft/:id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar borrador durante el wizard' })
  async updateDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @GetUser('id') userId: string
  ) {
    return this.addressService.updateDraft(id, dto, userId);
  }

  // =================================================================
  //  FLUJO GESTIÓN (EMPRESA YA CREADA)
  // =================================================================

  @Get('/company/:companyId')
  @Auth()
  @ApiOperation({ summary: 'Listar direcciones activas de una empresa' })
  async findAllForCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.addressService.findAllForCompany(companyId, userId, appRole, {
      includeInactive: includeInactive === 'true',
    });
  }

  @Delete('/company/:companyId/:addressId')
  @Auth()
  @ApiOperation({ summary: 'Desactivar dirección de empresa' })
  async remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    await this.addressService.softDeleteForCompany(companyId, addressId, userId, appRole);
    return { message: 'Dirección desactivada correctamente' };
  }
}