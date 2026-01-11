import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
// Asumo que tienes un AuthGuard estándar (ej: Passport JWT)
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; 
// Decorador personalizado para sacar el usuario del Request (ver nota abajo)
import { GetUser } from 'src/auth/decorators/get-user.decorator'; 
import { User } from 'src/user/entities/user.entity';

@ApiTags('Client Profiles (CRM)')
@ApiBearerAuth() // Indica a Swagger que estos endpoints requieren Token
@UseGuards(JwtAuthGuard) // Protege todos los endpoints de este controlador
@Controller('client-profiles')
export class ClientProfileController {
  constructor(private readonly clientProfileService: ClientProfileService) {}

  /* ------------------------------------------------------------------
   * 📝 CREAR CLIENTE
   * ------------------------------------------------------------------ */
  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva ficha de cliente',
    description: 'Crea un cliente vinculado a la empresa del usuario actual. Incluye datos fiscales y dirección inicial.' 
  })
  @ApiResponse({ status: 201, description: 'Cliente creado correctamente.' })
  @ApiResponse({ status: 409, description: 'Conflicto: El código interno ya existe en esta empresa.' })
  create(
    @GetUser() user: User, // 👈 Obtenemos el usuario del token
    @Body() createClientProfileDto: CreateClientProfileDto,
  ) {
    // Delegamos al servicio pasando explícitamente el companyId del usuario
    return this.clientProfileService.create(user.companyId, createClientProfileDto);
  }

  /* ------------------------------------------------------------------
   * 📋 LISTAR CLIENTES
   * ------------------------------------------------------------------ */
  @Get()
  @ApiOperation({ summary: 'Listar clientes de mi empresa' })
  findAll(@GetUser() user: User) {
    // TODO: Aquí deberías implementar paginación en el futuro
    return this.clientProfileService.findAll(user.companyId);
  }

  /* ------------------------------------------------------------------
   * 🔍 OBTENER UN CLIENTE
   * ------------------------------------------------------------------ */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    // Es vital pasar el companyId para asegurar que el usuario no consulte clientes de otra empresa
    return this.clientProfileService.findOne(id, user.companyId);
  }
}