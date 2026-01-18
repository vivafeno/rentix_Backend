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

/**
 * Controlador para la gestión de activos inmobiliarios.
 * * Estándares Blueprint 2026:
 * - RBAC: Acceso controlado por roles globales.
 * - Multi-tenancy: Extracción segura de companyId y companyRole desde el JWT.
 * - Swagger: Documentación técnica exhaustiva para integración Frontend.
 * * @version 1.2.1
 * @author Rentix
 */
@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /**
   * Recupera el catálogo de inmuebles activos de la empresa.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos operativos de la organización' })
  @ApiResponse({ status: 200, type: [Property] })
  async findAll(@GetUser() user: any): Promise<Property[]> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.findAll(user.companyId);
  }

  /**
   * Recupera los inmuebles que se encuentran en la papelera.
   * * Importante: Definido antes de :id para evitar colisiones de rutas.
   */
  @Get('trash')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos en la papelera (Inactivos)' })
  @ApiResponse({ status: 200, type: [Property] })
  async findTrash(@GetUser() user: any): Promise<Property[]> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.findTrash(user.companyId);
  }

  /**
   * Obtiene el detalle completo de un inmueble.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar detalle de activo por UUID' })
  @ApiResponse({ status: 200, type: Property })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.findOne(id, user.companyId);
  }

  /**
   * Registra una nueva unidad inmobiliaria en el sistema.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Registrar nueva unidad inmobiliaria' })
  @ApiResponse({ status: 201, type: Property })
  async create(
    @Body() createDto: CreatePropertyDto,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.create(user.companyId, createDto);
  }

  /**
   * Restaura un inmueble de la papelera devolviéndolo al catálogo activo.
   */
  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Restaurar activo desde la papelera' })
  @ApiResponse({ status: 200, type: Property })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.restore(id, user.companyId, user.companyRole);
  }

  /**
   * Actualiza los atributos físicos o técnicos de un inmueble.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar atributos de activo existente' })
  @ApiResponse({ status: 200, type: Property })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.update(id, user.companyId, updateDto);
  }

  /**
   * Realiza el borrado lógico del inmueble.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Mover activo a la papelera (Soft-Delete)' })
  @ApiResponse({ status: 200, type: Property })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.remove(id, user.companyId, user.companyRole);
  }

  /**
   * Validación interna de integridad del contexto organizacional.
   * @throws BadRequestException si no existe companyId en el token.
   */
  private validateCompanyContext(companyId: string | undefined): void {
    if (!companyId) {
      throw new BadRequestException('Contexto de empresa (companyId) es requerido');
    }
  }
}