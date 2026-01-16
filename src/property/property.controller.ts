import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos vinculados a la organización' })
  @ApiResponse({ status: 200, type: [Property] })
  async findAll(@GetUser() user: any): Promise<Property[]> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.findAll(user.companyId);
  }

  @Get('trash')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar activos en estado inactivo' })
  @ApiResponse({ status: 200, type: [Property] })
  async findTrash(@GetUser() user: any): Promise<Property[]> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.findTrash(user.companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Consultar detalle de activo por identificador' })
  @ApiResponse({ status: 200, type: Property })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    return this.propertyService.findOne(id, user.companyId);
  }

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Registrar nueva unidad inmobiliaria' })
  @ApiResponse({ status: 201, type: Property })
  async create(
    @Body() createDto: CreatePropertyDto,
    @GetUser() user: any,
  ): Promise<Property> {
    this.validateCompanyContext(user.companyId);
    return this.propertyService.create(user.companyId, createDto);
  }

  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Restaurar activo desde repositorio de eliminados' })
  @ApiResponse({ status: 200, type: Property })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    return this.propertyService.restore(id, user.companyId, user.companyRole);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar atributos de activo existente' })
  @ApiResponse({ status: 200, type: Property })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser() user: any,
  ): Promise<Property> {
    return this.propertyService.update(id, user.companyId, updateDto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Ejecutar borrado lógico de activo' })
  @ApiResponse({ status: 200, type: Property })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<Property> {
    return this.propertyService.remove(id, user.companyId, user.companyRole);
  }

  /**
   * Validación de integridad del contexto organizacional.
   */
  private validateCompanyContext(companyId: string | undefined): void {
    if (!companyId) {
      throw new BadRequestException('Identificador de organización no suministrado');
    }
  }
}