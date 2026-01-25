import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

/**
 * @class ContactController
 * @description Endpoint para la gestión de contactos vinculados a empresas o inquilinos.
 */
@ApiTags('Contacts')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contacto' })
  @ApiResponse({ status: 201, description: 'Contacto creado con éxito.', type: Contact })
  @ApiResponse({ status: 400, description: 'Error de validación o falta de asignación paterna.' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los contactos activos' })
  @ApiResponse({ status: 200, type: [Contact] })
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contacto por ID' })
  @ApiResponse({ status: 200, type: Contact })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado o inactivo.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un contacto / Cambiar estado isActive' })
  @ApiResponse({ status: 200, type: Contact })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un contacto (Soft Delete)' })
  @ApiResponse({ status: 204, description: 'Contacto desactivado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un contacto desactivado' })
  @ApiResponse({ status: 200, type: Contact })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.restore(id);
  }
}