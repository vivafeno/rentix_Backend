import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BillingConceptService } from './billing-concept.service';
import { CreateBillingConceptDto } from './dto/create-billing-concept.dto';
import { UpdateBillingConceptDto } from './dto/update-billing-concept.dto';
import { BillingConcept } from './entities/billing-concept.entity';
// Importación de tus Enums reales
import { AppRole } from '../auth/enums/user-global-role.enum';
import { CompanyRole } from '../user-company-role/enums/companyRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Billing Concepts')
@ApiBearerAuth()
@Controller('billing-concept')
export class BillingConceptController {
  constructor(private readonly service: BillingConceptService) {}

  @Post()
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, 
    
    
    
    
    CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Crear concepto en el catálogo maestro' })
  @ApiResponse({ status: 201, type: BillingConcept })
  create(@Body() createDto: CreateBillingConceptDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER, CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER, CompanyRole.VIEWER)
  @ApiOperation({ summary: 'Listar catálogo (Accesible para todos los roles de lectura)' })
  @ApiResponse({ status: 200, type: [BillingConcept] })
  findAll() {
    return this.service.findAll();


    
  }

  @Patch(':id')
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar plantilla de concepto' })
  @ApiResponse({ status: 200, type: BillingConcept })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateBillingConceptDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(AppRole.SUPERADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Soft Delete de un concepto (Solo SuperAdmin u Owner)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}