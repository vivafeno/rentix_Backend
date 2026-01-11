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
  ApiUnauthorizedResponse
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

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN) // Solo creadores de sistema
  @ApiOperation({
    summary: 'Crear empresa (Setup Wizard)',
    description: 'Crea la empresa vinculada a Facturae y asigna al creador como OWNER.'
  })
  @ApiResponse({ status: 201, type: Company, description: 'Empresa creada con éxito' })
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetUser('id') userId: string,
  ) {
    return this.companyService.createCompany(createCompanyDto, userId);
  }

  @Get('me')
  @Auth() // Cualquier usuario autenticado
  @ApiOperation({
    summary: 'Mis empresas vinculadas',
    description: 'Filtra empresas por el ID del usuario extraído del token.'
  })
  @ApiResponse({ status: 200, type: [CompanyMeDto] })
  async getMyCompanies(@GetUser('id') userId: string) {
    return this.companyService.getCompaniesForUser(userId);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN) // Listado total solo para SuperAdmin
  @ApiOperation({ summary: 'Listado global de empresas (Solo SuperAdmin)' })
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener detalle de una empresa con validación de acceso' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  @ApiResponse({ status: 200, type: Company })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole, // 👈 Corregido: antes ponía 'role'
  ) {
    // Si es SUPERADMIN, el service debería saltarse la validación de propiedad
    return this.companyService.findOneWithAccess(id, userId, appRole);
  }

  @Patch(':id')
  @Auth() // La lógica de si es OWNER se valida en el Service
  @ApiOperation({ summary: 'Actualizar datos de la empresa (Requiere ser Owner o Admin Global)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any, 
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    return this.companyService.updateWithAccess(id, updateDto, userId, appRole);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado lógico de la empresa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ) {
    return this.companyService.softDeleteWithAccess(id, userId, appRole);
  }
}