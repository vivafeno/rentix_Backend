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
  ApiExtraModels,
} from '@nestjs/swagger';

import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { Tenant } from './entities/tenant.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class TenantController
 * @description Gestión de Arrendatarios con blindaje multi-tenant.
 * Sincronizado con la interfaz ActiveUserData para garantizar la seguridad tipada.
 */
@ApiTags('Tenants')
@ApiBearerAuth()
@ApiExtraModels(Tenant)
@Controller('tenants')
@Auth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo arrendatario' })
  @ApiCreatedResponse({ type: Tenant })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Tenant> {
    return await this.tenantService.create(companyId, createTenantDto, companyRole);
  }

  @Get()
  @ApiOperation({ summary: 'Listar arrendatarios de la empresa activa' })
  @ApiOkResponse({ type: [Tenant] })
  async findAll(
    @GetUser('activeCompanyId') companyId: string,
    // 🚩 SOLUCIÓN FINAL: La propiedad correcta en ActiveUserData es 'appRole'
    @GetUser('appRole') appRole: AppRole, 
  ): Promise<Tenant[]> {
    return await this.tenantService.findAll(companyId, appRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta de ficha detallada' })
  @ApiOkResponse({ type: Tenant })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Tenant> {
    return await this.tenantService.findOne(id, companyId, appRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización de datos operativos' })
  @ApiOkResponse({ type: Tenant })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Tenant> {
    return await this.tenantService.update(id, companyId, updateTenantDto, companyRole, appRole);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alternar estado operativo' })
  @ApiOkResponse({ type: Tenant })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Tenant> {
    return await this.tenantService.toggleStatus(id, companyId, isActive, companyRole);
  }
}