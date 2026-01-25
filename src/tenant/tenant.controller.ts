import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto'
import { Tenant } from './entities/tenant.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class TenantController
 * @description Gestión de Arrendatarios con blindaje multi-tenant.
 * El aislamiento se garantiza mediante la extracción del companyId del JWT.
 * @author Rentix 2026
 * @version 2.2.0
 */
@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@Auth() // Protección base para cualquier usuario autenticado
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo arrendatario (Sujeto Fiscal)' })
  @ApiCreatedResponse({ type: Tenant })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Tenant> {
    return this.tenantService.create(companyId, createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar arrendatarios (Contextual: Activos/Inactivos)' })
  @ApiOkResponse({ type: [Tenant] })
  async findAll(
    @GetUser('companyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Tenant[]> {
    return this.tenantService.findAll(companyId, appRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta de ficha detallada del arrendatario' })
  @ApiOkResponse({ type: Tenant })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Tenant> {
    return this.tenantService.findOne(id, companyId, appRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial de datos operativos o SEPA' })
  @ApiOkResponse({ type: Tenant })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @GetUser('companyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Tenant> {
    return this.tenantService.update(id, companyId, updateTenantDto, appRole);
  }

  /**
   * @method toggleStatus
   * @description El interruptor de vida operativa del inquilino. Reemplaza al DELETE.
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Alternar estado operativo (Activar/Desactivar)' })
  @ApiOkResponse({ type: Tenant })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
    @GetUser('companyId') companyId: string,
  ): Promise<Tenant> {
    return this.tenantService.toggleStatus(id, companyId, isActive);
  }
}