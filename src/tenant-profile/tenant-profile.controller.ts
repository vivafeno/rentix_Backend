import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantProfileService } from './tenant-profile.service';
import { CreateTenantProfileDto, UpdateTenantProfileDto } from './dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('CRM - Tenant Profiles')
@ApiBearerAuth()
@Controller('tenant-profiles')
@Auth()
export class TenantProfileController {
  constructor(private readonly profileService: TenantProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Crear perfil de cliente' })
  async create(
    @Body() dto: CreateTenantProfileDto,
    @GetUser('activeCompanyId') companyId: string,
  ) {
    return await this.profileService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los clientes de la empresa' })
  async findAll(@GetUser('activeCompanyId') companyId: string) {
    return await this.profileService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
  ) {
    return await this.profileService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar perfil fiscal' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @Body() dto: UpdateTenantProfileDto,
  ) {
    return await this.profileService.update(id, companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Baja lógica de cliente' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
  ) {
    return await this.profileService.remove(id, companyId);
  }
}