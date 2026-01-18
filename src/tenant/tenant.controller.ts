import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Tenant } from './entities/tenant.entity';

/**
 * Controlador para la gestión de Arrendatarios (Tenants).
 * Implementa seguridad vía JWT y aislamiento por empresa.
 * * @author Gemini Blueprint 2026
 */
@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Crea un nuevo arrendatario vinculado a la empresa del usuario actual.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo arrendatario' })
  @ApiResponse({ status: 201, type: Tenant })
  create(@Body() createTenantDto: CreateTenantDto) {
    // Nota: El companyId ya viene en el DTO según tu diseño de pasos previos
    return this.tenantService.create(createTenantDto);
  }

  /**
   * Obtiene la lista completa de arrendatarios de la empresa activa.
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los arrendatarios de la empresa' })
  findAll(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.tenantService.findAll(companyId);
  }

  /**
   * Obtiene el detalle de un arrendatario por su UUID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un arrendatario por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ) {
    return this.tenantService.findOne(id, req.user.companyId);
  }

  /**
   * Actualiza los datos de un arrendatario.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un arrendatario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Req() req: any
  ) {
    return this.tenantService.update(id, updateTenantDto, req.user.companyId);
  }

  /**
   * Realiza un borrado lógico del arrendatario.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un arrendatario (Soft Delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ) {
    return this.tenantService.remove(id, req.user.companyId);
  }
}