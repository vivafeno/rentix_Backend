import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { PropertyService } from './property.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { Property } from './entities/property.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class PropertyController
 * @description Gestión de activos inmobiliarios con rigor Multi-tenant.
 * @author Rentix 2026
 * @version 2.5.0
 */
@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@Auth() // Protección base para cualquier usuario autenticado
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ summary: 'Listado de activos (Contextual: Activos/Inactivos)' })
  @ApiOkResponse({ type: [Property] })
  async findAll(
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Property[]> {
    return this.propertyService.findAll(companyId, appRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta de ficha técnica de activo' })
  @ApiOkResponse({ type: Property })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Property> {
    return this.propertyService.findOne(id, companyId, appRole);
  }

  @Post()
  @ApiOperation({ summary: 'Alta atómica de activo e infraestructura geográfica' })
  @ApiCreatedResponse({ type: Property })
  async create(
    @Body() createDto: CreatePropertyDto,
    @GetUser('activeCompanyId') companyId: string,
  ): Promise<Property> {
    // El companyId viene del contexto de selección del usuario
    return this.propertyService.create(companyId, createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial de atributos y dirección' })
  @ApiOkResponse({ type: Property })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Property> {
    return this.propertyService.update(id, companyId, updateDto, appRole);
  }

  /**
   * @method toggleStatus
   * @description El interruptor de vida del activo. Reemplaza Delete y Restore.
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Alternar estado operativo (Activar/Desactivar)' })
  @ApiOkResponse({ type: Property })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Property> {
    return this.propertyService.toggleStatus(id, companyId, isActive, companyRole);
  }
}