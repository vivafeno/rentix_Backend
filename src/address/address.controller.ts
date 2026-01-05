import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { HttpCode, HttpStatus } from '@nestjs/common';


@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserGlobalRole.SUPERADMIN,
  UserGlobalRole.ADMIN,
  UserGlobalRole.USER,
)
@Controller('companies/:companyId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // ─────────────────────────────────────
  // Crear dirección para empresa
  // ─────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear dirección para una empresa',
    description:
      'Crea una dirección asociada a una empresa. ' +
      'Solo puede existir una dirección FISCAL activa por empresa.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
    example: '87366cda-54c1-4ce3-9e51-4d7a62d8d9de',
  })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada correctamente',
    type: Address,
  })
  createForCompany(
    @Param('companyId') companyId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createForCompany(companyId, dto);
  }

  // ─────────────────────────────────────
  // Listar direcciones de empresa
  // ─────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar direcciones de una empresa',
    description:
      'Por defecto solo muestra direcciones activas. ' +
      'Usa showInactive=true para incluir las inactivas.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    type: Boolean,
    description: 'Incluye direcciones inactivas',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de direcciones',
    type: [Address],
  })
  findAllForCompany(
    @Param('companyId') companyId: string,
    @Query('showInactive') showInactive?: 'true' | 'false',
  ) {
    return this.addressService.findAllForCompany(companyId, {
      includeInactive: showInactive === 'true',
    });
  }

  // ─────────────────────────────────────
  // Obtener dirección concreta
  // ─────────────────────────────────────
  @Get(':addressId')
  @ApiOperation({
    summary: 'Obtener una dirección concreta de una empresa',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección encontrada',
    type: Address,
  })
  async findOneForCompany(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
  ) {
    const address = await this.addressService.findOneForCompany(
      companyId,
      addressId,
    );

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return address;
  }

  // ─────────────────────────────────────
  // Actualizar dirección
  // ─────────────────────────────────────
  @Patch(':addressId')
  @ApiOperation({
    summary: 'Actualizar dirección de una empresa',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada',
    type: Address,
  })
  async updateForCompany(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressService.updateForCompany(
      companyId,
      addressId,
      dto,
    );

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return address;
  }

  // ─────────────────────────────────────
  // Soft delete
  // ─────────────────────────────────────
  @Delete(':addressId')
  @ApiOperation({
    summary: 'Desactivar dirección (soft delete)',
    description: 'Marca la dirección como inactiva (isActive=false)',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'addressId', description: 'UUID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección desactivada correctamente',
  })
  async removeForCompany(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
  ) {
    const ok = await this.addressService.softDeleteForCompany(
      companyId,
      addressId,
    );

    if (!ok) {
      throw new NotFoundException(
        'Dirección no encontrada o ya desactivada',
      );
    }

    return { message: 'Dirección desactivada correctamente' };
  }
}
