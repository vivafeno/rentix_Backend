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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class PropertyController
 * @description Gestión del inventario de activos inmobiliarios.
 * Implementa Multi-tenancy mediante aislamiento por companyId inyectado en el JWT.
 * @author Rentix 2026
 * @version 2.4.0
 */
@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /**
   * @method findAll
   * @description Recupera el catálogo de inmuebles operativos del patrimonio actual.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos operativos del patrimonio' })
  @ApiResponse({ status: 200, type: [Property] })
  async findAll(
    @GetUser('companyId') companyId: string,
  ): Promise<Property[]> {
    this.validateCompanyContext(companyId);
    return this.propertyService.findAll(companyId);
  }

  /**
   * @method findTrash
   * @description Recupera los inmuebles en estado 'Eliminado Lógico'.
   */
  @Get('trash')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos en la papelera' })
  @ApiResponse({ status: 200, type: [Property] })
  async findTrash(
    @GetUser('companyId') companyId: string,
  ): Promise<Property[]> {
    this.validateCompanyContext(companyId);
    return this.propertyService.findTrash(companyId);
  }

  /**
   * @method findOne
   * @description Obtiene la ficha técnica completa de un inmueble.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar detalle de activo por UUID' })
  @ApiResponse({ status: 200, type: Property })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<Property> {
    this.validateCompanyContext(companyId);
    return this.propertyService.findOne(id, companyId);
  }

  /**
   * @method create
   * @description Registra un nuevo activo con creación atómica de dirección.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Registrar nueva unidad inmobiliaria' })
  @ApiResponse({ status: 201, type: Property })
  async create(
    @Body() createDto: CreatePropertyDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Property> {
    this.validateCompanyContext(companyId);
    return this.propertyService.create(companyId, createDto);
  }

  /**
   * @method restore
   * @description Recupera un activo de la papelera (Soft-delete rollback).
   */
  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Restaurar activo desde la papelera' })
  @ApiResponse({ status: 200, type: Property })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Property> {
    this.validateCompanyContext(companyId);
    return this.propertyService.restore(id, companyId, companyRole);
  }

  /**
   * @method update
   * @description Actualiza los atributos del activo. Solo editable por OWNER o REPRESENTATIVE.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar atributos de activo existente' })
  @ApiResponse({ status: 200, type: Property })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Property> {
    this.validateCompanyContext(companyId);
    return this.propertyService.update(id, companyId, updateDto);
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico del inmueble.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Mover activo a la papelera (Soft-Delete)' })
  @ApiResponse({ status: 200, type: Property })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Property> {
    this.validateCompanyContext(companyId);
    return this.propertyService.remove(id, companyId, companyRole);
  }

  /**
   * @private
   * @description Valida la existencia del contexto organizacional en la traza del JWT.
   */
  private validateCompanyContext(companyId: string | undefined): void {
    if (!companyId) {
      throw new BadRequestException('Contexto de empresa (companyId) es requerido para operar con activos.');
    }
  }
}