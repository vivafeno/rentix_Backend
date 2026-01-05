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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { VatRateService } from './vat-rate.service';
import { CreateVatRateDto } from './dto/create-vat-rate.dto';
import { UpdateVatRateDto } from './dto/update-vat-rate.dto';
import { VatRate } from './vat-rate.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('VAT Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
@Controller('vat-rates')
export class VatRateController {
  constructor(private readonly vatRateService: VatRateService) {}

  /* ─────────────────────────────────────
   * Crear IVA
   * ───────────────────────────────────── */
  @Post()
  @ApiOperation({ summary: 'Crear tipo de IVA' })
  @ApiResponse({
    status: 201,
    description: 'IVA creado correctamente',
    type: VatRate,
  })
  create(@Body() dto: CreateVatRateDto) {
    return this.vatRateService.create(dto);
  }

  /* ─────────────────────────────────────
   * Listar IVAs por país
   * ───────────────────────────────────── */
  @Get()
  @ApiOperation({
    summary: 'Listar tipos de IVA por país',
    description:
      'Devuelve los IVAs activos por defecto. Usa showInactive=true para incluir inactivos.',
  })
  @ApiQuery({
    name: 'countryCode',
    required: true,
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
  })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    type: Boolean,
    description: 'Incluye IVAs inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de IVAs',
    type: [VatRate],
  })
  findAll(
    @Query('countryCode') countryCode: string,
    @Query('showInactive') showInactive?: string,
  ) {
    return this.vatRateService.findAll(countryCode, {
      includeInactive: showInactive === 'true',
    });
  }

  /* ─────────────────────────────────────
   * Obtener IVA concreto
   * ───────────────────────────────────── */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un IVA concreto' })
  @ApiParam({ name: 'id', description: 'UUID del IVA' })
  @ApiResponse({
    status: 200,
    description: 'IVA encontrado',
    type: VatRate,
  })
  async findOne(@Param('id') id: string) {
    const vatRate = await this.vatRateService.findOne(id);
    if (!vatRate) {
      throw new NotFoundException('IVA no encontrado');
    }
    return vatRate;
  }

  /* ─────────────────────────────────────
   * Actualizar IVA
   * ───────────────────────────────────── */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de IVA' })
  @ApiParam({ name: 'id', description: 'UUID del IVA' })
  @ApiResponse({
    status: 200,
    description: 'IVA actualizado',
    type: VatRate,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVatRateDto,
  ) {
    const vatRate = await this.vatRateService.update(id, dto);
    if (!vatRate) {
      throw new NotFoundException('IVA no encontrado');
    }
    return vatRate;
  }

  /* ─────────────────────────────────────
   * Desactivar IVA
   * ───────────────────────────────────── */
  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar tipo de IVA',
    description: 'Soft delete: marca el IVA como inactivo',
  })
  @ApiParam({ name: 'id', description: 'UUID del IVA' })
  async deactivate(@Param('id') id: string) {
    const ok = await this.vatRateService.deactivate(id);
    if (!ok) {
      throw new NotFoundException('IVA no encontrado o ya inactivo');
    }
    return { message: 'IVA desactivado correctamente' };
  }
}
