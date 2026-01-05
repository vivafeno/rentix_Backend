import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Contact')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN, UserGlobalRole.USER)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'Crear nuevo contacto' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contacto creado correctamente', type: Contact })
  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @ApiOperation({ summary: 'Listar contactos activos' })
  @ApiResponse({ status: 200, description: 'Lista de contactos activos', type: [Contact] })
  @Get()
  async findAll() {
    return this.contactService.findAll();
  }

  @ApiOperation({ summary: 'Listar contactos inactivos' })
  @ApiResponse({ status: 200, description: 'Lista de contactos inactivos', type: [Contact] })
  @Get('inactive')
  async findInactive() {
    return this.contactService.findInactive();
  }

  @ApiOperation({ summary: 'Buscar contacto por id' })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Contacto encontrado', type: Contact })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.contactService.findOne(id);
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return contact;
  }

  @ApiOperation({ summary: 'Actualizar contacto por id' })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({ status: 200, description: 'Contacto actualizado', type: Contact })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }

  @ApiOperation({ summary: 'Eliminar contacto (soft delete)' })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Contacto eliminado', type: Contact })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.contactService.remove(id);
    if (!deleted) throw new NotFoundException('Contacto no encontrado');
    return deleted;
  }
}
