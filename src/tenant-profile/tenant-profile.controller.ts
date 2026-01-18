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
import { TenantProfileService } from './tenant-profile.service';
import { CreateTenantProfileDto } from './dto/create-tenant-profile.dto';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Tenant Profiles (CRM)')
@ApiBearerAuth()
@Controller('client-profiles')
export class TenantProfileController {
  constructor(private readonly clientProfileService: TenantProfileService) { }

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({
    summary: 'Crear cliente',
    description: 'Crea un cliente CRM + Identidad Fiscal + Dirección Fiscal en una sola operación.'
  })
  @ApiResponse({ status: 201, description: 'Cliente creado correctamente.' })
  create(
    @Body() createDto: CreateTenantProfileDto,
    @GetUser() user: any,
  ) {
    // Ahora definimos la variable que usas abajo
    const companyId = user.companyId;
    if (!companyId) {
      throw new BadRequestException(
        'No has seleccionado ninguna empresa. Usa el endpoint /company-context/select para obtener un token de acceso a empresa.'
      );
    }
    return this.clientProfileService.create(companyId, createDto);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar clientes de mi empresa' })
  findAll(@GetUser('companyId') companyId: string) {
    return this.clientProfileService.findAll(companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.findOne(id, companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar datos CRM del cliente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTenantProfileDto,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.update(id, companyId, updateDto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar cliente (Soft delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ) {
    return this.clientProfileService.remove(id, companyId);
  }
}