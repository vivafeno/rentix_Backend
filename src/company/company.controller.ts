import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserGlobalRole } from 'src/user/entities/user.entity';

@ApiTags('Company')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiOperation({ summary: 'Crear nueva empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa creada', type: Company })
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @ApiOperation({ summary: 'Listar todas las empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas', type: [Company] })
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Empresa encontrada', type: Company })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
    // Si manejas not found, agrega lanzado de excepción aquí
  }

  @ApiOperation({ summary: 'Actualizar empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la empresa', required: true })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Empresa actualizada', type: Company })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
    // Si manejas not found, agrega lanzado de excepción aquí
  }

  @ApiOperation({ summary: 'Eliminar empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Empresa eliminada', type: Company })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
    // Si manejas not found, agrega lanzado de excepción aquí
  }
}
