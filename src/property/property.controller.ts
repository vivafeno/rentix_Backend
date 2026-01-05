import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { PropertyService } from './property.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { Property } from './entities/property.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN, UserGlobalRole.USER)
@Controller('companies/:companyId/properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Crear inmueble para una empresa' })
  @ApiResponse({ status: 201, type: Property })
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertyService.createForCompany(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar inmuebles de una empresa' })
  findAll(@Param('companyId') companyId: string) {
    return this.propertyService.findAllForCompany(companyId);
  }

  @Get(':propertyId')
  @ApiOperation({ summary: 'Obtener inmueble concreto' })
  async findOne(
    @Param('companyId') companyId: string,
    @Param('propertyId') propertyId: string,
  ) {
    const property = await this.propertyService.findOneForCompany(companyId, propertyId);
    if (!property) throw new NotFoundException('Inmueble no encontrado');
    return property;
  }

  @Patch(':propertyId')
  @ApiOperation({ summary: 'Actualizar inmueble' })
  async update(
    @Param('companyId') companyId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    const property = await this.propertyService.updateForCompany(companyId, propertyId, dto);
    if (!property) throw new NotFoundException('Inmueble no encontrado');
    return property;
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'Desactivar inmueble (soft delete)' })
  async remove(
    @Param('companyId') companyId: string,
    @Param('propertyId') propertyId: string,
  ) {
    const ok = await this.propertyService.softDeleteForCompany(companyId, propertyId);
    if (!ok) throw new NotFoundException('Inmueble no encontrado o ya inactivo');
    return { message: 'Inmueble desactivado correctamente' };
  }
}
