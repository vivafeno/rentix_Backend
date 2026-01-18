import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * @description Controlador para la gestión de Patrimonios y Entidades Legales.
 * Implementa la abstracción de roles para la creación atómica de sujetos.
 * @version 2026.1.17
 */
@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autorizado - Token inválido o ausente' })
@ApiForbiddenResponse({ description: 'Prohibido - No tienes los permisos necesarios' })
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // --------------------------------------------------------------------------
  // CREACIÓN ATÓMICA (WIZARD FLOW)
  // --------------------------------------------------------------------------

  @Post('owner')
  @Auth(AppRole.SUPERADMIN) // O el rol que permitas para crear Patrimonios
  @ApiOperation({
    summary: 'Crear nuevo Patrimonio (Owner)',
    description: 'Crea Empresa + Identidad Fiscal + Dirección y asigna el rol OWNER internamente.'
  })
  @ApiCreatedResponse({ type: Company })
  async createOwner(@Body() dto: CreateCompanyLegalDto) {
    return this.companyService.createOwner(dto);
  }

  @Post('tenant')
  @Auth() // Cualquier usuario autenticado con permisos de gestión
  @ApiOperation({
    summary: 'Crear nuevo Arrendatario (Tenant)',
    description: 'Crea la estructura legal del inquilino y asigna el rol TENANT internamente.'
  })
  @ApiCreatedResponse({ type: Company })
  async createTenant(@Body() dto: CreateCompanyLegalDto) {
    return this.companyService.createTenant(dto);
  }

  @Post('viewer')
  @Auth()
  @ApiOperation({
    summary: 'Crear nuevo Gestor/Asesor (Viewer)',
    description: 'Crea la estructura legal y asigna el rol VIEWER internamente.'
  })
  @ApiCreatedResponse({ type: Company })
  async createViewer(@Body() dto: CreateCompanyLegalDto) {
    return this.companyService.createViewer(dto);
  }

  // --------------------------------------------------------------------------
  // CONSULTA Y GESTIÓN (TENANT ISOLATION)
  // --------------------------------------------------------------------------

  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Mis patrimonios vinculados',
    description: 'Retorna las empresas donde el usuario actual tiene acceso.'
  })
  @ApiResponse({ status: 200, type: [Company] })
  async getMyCompanies(@GetUser('id') userId: string) {
    return this.companyService.findAllByUser(userId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Detalle de empresa con validación de acceso' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  @ApiResponse({ status: 200, type: Company })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.companyService.findOne(id, userId);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar empresa (Owner o Admin)' })
  @ApiResponse({ status: 200, type: Company })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
    @GetUser('id') userId: string,
  ) {
    return this.companyService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Borrado lógico de la empresa' })
  @ApiResponse({ status: 204 })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.companyService.remove(id, userId);
  }
}