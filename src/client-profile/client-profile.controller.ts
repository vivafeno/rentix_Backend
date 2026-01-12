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
import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Client Profiles (CRM)')
@ApiBearerAuth()
@Controller('client-profiles')
export class ClientProfileController {
  constructor(private readonly clientProfileService: ClientProfileService) { }

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({
    summary: 'Crear cliente',
    description: 'Crea un cliente CRM + Identidad Fiscal + Dirección Fiscal en una sola operación.'
  })
  @ApiResponse({ status: 201, description: 'Cliente creado correctamente.' })
  create(
    @Body() createDto: CreateClientProfileDto,
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
    @Body() updateDto: UpdateClientProfileDto,
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