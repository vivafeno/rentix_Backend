import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';

import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class ContactController
 * @description Gestión Multi-tenant de contactos (Inquilinos, Propietarios, Proveedores).
 * Implementa seguridad por contexto de empresa activa.
 */
@ApiTags('Contacts')
@ApiBearerAuth()
@ApiExtraModels(Contact)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo contacto para la empresa activa' })
  @ApiResponse({ status: 201, type: Contact, description: 'Contacto creado y vinculado.' })
  async create(
    @Body() createContactDto: CreateContactDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contact> {
    return await this.contactService.create(
      companyId,
      createContactDto,
      companyRole
    );
  }

  @Get()
  @Auth() // Acceso para cualquier rol autenticado en la empresa
  @ApiOperation({ summary: 'Listar contactos de la empresa actual' })
  @ApiResponse({ status: 200, type: [Contact] })
  async findAll(@GetUser('activeCompanyId') companyId: string): Promise<Contact[]> {
    return await this.contactService.findAll(companyId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener detalle de un contacto por ID' })
  @ApiResponse({ status: 200, type: Contact })
  @ApiResponse({ status: 404, description: 'Contacto no localizado en esta empresa.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
  ): Promise<Contact> {
    return await this.contactService.findOne(id, companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de un contacto' })
  @ApiResponse({ status: 200, type: Contact })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contact> {
    return await this.contactService.update(
      id,
      companyId,
      updateContactDto,
      companyRole
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar un contacto (Soft Delete)' })
  @ApiResponse({ status: 204, description: 'Contacto desactivado.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<void> {
    return await this.contactService.remove(id, companyId, companyRole);
  }

  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Restaurar un contacto desactivado' })
  @ApiResponse({ status: 200, type: Contact })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contact> {
    return await this.contactService.restore(id, companyId, companyRole);
  }
}