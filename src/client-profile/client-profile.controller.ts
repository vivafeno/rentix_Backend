import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { ClientProfile } from './entities/client-profile.entity'; // Suponiendo que existe la entidad

@ApiTags('ClientProfile')
@Controller('client-profile')
export class ClientProfileController {
  constructor(private readonly clientProfileService: ClientProfileService) {}

  @ApiOperation({ summary: 'Crear perfil de cliente' })
  @ApiBody({ type: CreateClientProfileDto })
  @ApiResponse({ status: 201, description: 'Cliente creado', type: ClientProfile })
  @Post()
  create(@Body() createClientProfileDto: CreateClientProfileDto) {
    return this.clientProfileService.create(createClientProfileDto);
  }

  @ApiOperation({ summary: 'Listar todos los perfiles de cliente' })
  @ApiResponse({ status: 200, description: 'Lista de client profiles', type: [ClientProfile] })
  @Get()
  findAll() {
    return this.clientProfileService.findAll();
  }

  @ApiOperation({ summary: 'Obtener perfil de cliente por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del perfil de cliente', required: true })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: ClientProfile })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProfileService.findOne(id);
    // Si quieres lanzar 404, agrega comprobación y NotFoundException
  }

  @ApiOperation({ summary: 'Actualizar perfil de cliente por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del perfil de cliente', required: true })
  @ApiBody({ type: UpdateClientProfileDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado', type: ClientProfile })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientProfileDto: UpdateClientProfileDto) {
    return this.clientProfileService.update(id, updateClientProfileDto);
    // Si quieres lanzar 404, agrega comprobación y NotFoundException
  }

  @ApiOperation({ summary: 'Eliminar perfil de cliente por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del perfil de cliente', required: true })
  @ApiResponse({ status: 200, description: 'Cliente eliminado', type: ClientProfile })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientProfileService.remove(id);
    // Si quieres lanzar 404, agrega comprobación y NotFoundException
  }
}
