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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { Property } from './entities/property.entity';

@ApiTags('Properties (Inmuebles)')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Crear Propiedad' })
  @ApiResponse({ status: 201, type: Property })
  create(@Body() createDto: CreatePropertyDto, @GetUser() user: any): Promise<Property> {
    if (!user.companyId) throw new BadRequestException('Contexto de empresa requerido');
    return this.propertyService.create(user.companyId, createDto);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar Propiedades' })
  @ApiResponse({ status: 200, type: [Property] })
  findAll(@GetUser() user: any): Promise<Property[]> {
    if (!user.companyId) throw new BadRequestException('Contexto de empresa requerido');
    return this.propertyService.findAll(user.companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Detalle de Propiedad' })
  @ApiResponse({ status: 200, type: Property })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any): Promise<Property> {
    return this.propertyService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar Propiedad' })
  @ApiResponse({ status: 200, type: Property })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser() user: any,
  ): Promise<Property> {
    return this.propertyService.update(id, user.companyId, updateDto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado Lógico (Soft Delete)' })
  @ApiResponse({ status: 200, type: Property })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any): Promise<Property> {
    return this.propertyService.remove(id, user.companyId);
  }
}