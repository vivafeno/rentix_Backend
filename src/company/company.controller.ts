import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, CompanyMeDto } from './dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autorizado - Token inválido o ausente' })
@ApiForbiddenResponse({ description: 'Prohibido - No tienes los permisos necesarios' })
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  /**
   * PASO 4 DEL WIZARD: Creación final de la empresa.
   * Solo el SUPERADMIN puede ejecutar esta acción.
   * El DTO contiene el userId seleccionado en el PASO 1.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN) 
  @ApiOperation({
    summary: 'Finalizar creación de empresa (Paso 4 Wizard)',
    description: 'Vincula la identidad fiscal y dirección, y asigna automáticamente el rol OWNER al userId proporcionado en el DTO.'
  })
  @ApiCreatedResponse({ 
    type: Company, 
    description: 'Empresa creada exitosamente y rol de OWNER asignado al usuario indicado.' 
  })
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetUser('id') creatorId: string, // ID del SuperAdmin que opera
  ) {
    // Pasamos el DTO (que lleva el userId del Paso 1) y el ID del SuperAdmin para auditoría
    return this.companyService.createCompany(createCompanyDto, creatorId);
  }

  @Get('me')
  @Auth() 
  @ApiOperation({
    summary: 'Mis empresas vinculadas (Selector de contexto)',
    description: 'Retorna todas las empresas donde el usuario actual tiene un rol (Owner, Gestor, Cliente).'
  })
  @ApiResponse({ status: 200, type: [CompanyMeDto] })
  async getMyCompanies(@GetUser('id') userId: string) {
    return this.companyService.getCompaniesForUser(userId);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listado global de todas las empresas (Solo SuperAdmin)' })
  @ApiResponse({ status: 200, type: [Company] })
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Detalle de empresa con validación de acceso' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  @ApiResponse({ status: 200, type: Company })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    return this.companyService.findOneWithAccess(id, userId, appRole);
  }

  @Patch(':id')
  @Auth() 
  @ApiOperation({ summary: 'Actualizar empresa (Requiere ser OWNER o SUPERADMIN)' })
  @ApiResponse({ status: 200, type: Company })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any, 
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    return this.companyService.updateWithAccess(id, updateDto, userId, appRole);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Borrado lógico de la empresa' })
  @ApiResponse({ status: 204, description: 'Empresa desactivada correctamente' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    return this.companyService.softDeleteWithAccess(id, userId, appRole);
  }

  @Get(':id/members')
  @Auth()
  @ApiOperation({ summary: 'Listar miembros y roles de una empresa específica' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.getCompanyMembers(id);
  }
}