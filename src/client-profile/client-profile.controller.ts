import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Client Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('client-profiles')
export class ClientProfileController {
  constructor(
    private readonly clientProfileService: ClientProfileService,
  ) {}

  // ➕ Crear cliente para empresa
  @Post('company/:companyId')
  @ApiOperation({ summary: 'Crear cliente para una empresa' })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateClientProfileDto,
  ) {
    return this.clientProfileService.createForCompany(companyId, dto);
  }

  // 📄 Listar clientes de empresa
  @Get('company/:companyId')
  @ApiOperation({ summary: 'Listar clientes de una empresa' })
  findAll(@Param('companyId') companyId: string) {
    return this.clientProfileService.findAllForCompany(companyId);
  }

  // 🔍 Obtener cliente
  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findOne(@Param('id') id: string) {
    return this.clientProfileService.findOne(id);
  }

  // ✏️ Actualizar cliente
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientProfileDto,
  ) {
    return this.clientProfileService.update(id, dto);
  }

  // 🗑️ Soft delete
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar cliente (soft delete)' })
  remove(@Param('id') id: string) {
    return this.clientProfileService.softDelete(id);
  }
}
