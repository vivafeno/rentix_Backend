import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Address } from './entities/address.entity';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva dirección' })
  @ApiResponse({ status: 201, description: 'Dirección creada correctamente', type: Address })
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar direcciones',
    description: 'Por defecto solo muestra direcciones activas (isActive=true). Para incluir también las inactivas, usa el query param showInactive=true.'
  })
  @ApiQuery({ name: 'showInactive', required: false, description: 'Si es true, incluye direcciones inactivas.', type: Boolean })
  @ApiResponse({ status: 200, description: 'Listado de direcciones', type: [Address] })
  findAll(@Query('showInactive') showInactive?: string) {
    const includeInactive = showInactive === 'true';
    return this.addressService.findAll({ includeInactive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una dirección por ID, solo si existe' })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección encontrada', type: Address })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async findOne(@Param('id') id: string) {
    const address = await this.addressService.findOne(id);
    if (!address) throw new NotFoundException('Dirección no encontrada');
    return address;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar dirección por ID',
    description: 'Permite actualizar cualquier campo, incluido reactivar/desactivar (isActive)'
  })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección actualizada', type: Address })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    const address = await this.addressService.update(id, updateAddressDto);
    if (!address) throw new NotFoundException('Dirección no encontrada');
    return address;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete: Desactivar dirección (isActive=false)',
    description: 'No elimina físicamente, solo marca isActive como false. Solo accesible en la API si reactivas con PATCH.'
  })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección desactivada (soft delete)' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada o ya desactivada' })
  async remove(@Param('id') id: string) {
    const result = await this.addressService.softDelete(id);
    if (!result) throw new NotFoundException('Dirección no encontrada o ya desactivada');
    return { message: 'Dirección desactivada correctamente (soft delete)' };
  }
}
