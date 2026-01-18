import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class TenantController
 * @description Gestión de Arrendatarios con blindaje multi-tenant.
 * El aislamiento se garantiza mediante la extracción del companyId del JWT.
 * @author Rentix 2026
 * @version 2.1.0
 */
@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * @method create
   * @description Registra un nuevo arrendatario inyectando el contexto de empresa del usuario.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Crear un nuevo arrendatario' })
  @ApiResponse({ status: 201, type: Tenant })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @GetUser('companyId') companyId: string, // 🚩 Context Overriding
  ): Promise<Tenant> {
    return this.tenantService.create(companyId, createTenantDto);
  }

  /**
   * @method findAll
   * @description Listado de arrendatarios operativos para la empresa actual.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar todos los arrendatarios de la empresa' })
  @ApiResponse({ status: 200, type: [Tenant] })
  async findAll(@GetUser('companyId') companyId: string): Promise<Tenant[]> {
    return this.tenantService.findAll(companyId);
  }

  /**
   * @method findOne
   * @description Consulta detallada de un arrendatario validando pertenencia.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener un arrendatario por ID' })
  @ApiResponse({ status: 200, type: Tenant })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<Tenant> {
    return this.tenantService.findOne(id, companyId);
  }

  /**
   * @method update
   * @description Actualización parcial de datos del arrendatario.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar un arrendatario' })
  @ApiResponse({ status: 200, type: Tenant })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Tenant> {
    return this.tenantService.update(id, companyId, updateTenantDto);
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico del registro.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Eliminar un arrendatario (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Registro movido a la papelera.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<void> {
    return this.tenantService.remove(id, companyId);
  }
}