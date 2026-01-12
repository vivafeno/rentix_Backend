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

@ApiTags('Properties (Inmuebles)')
@ApiBearerAuth() // Requiere token Bearer
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ 
    summary: 'Crear Propiedad', 
    description: 'Crea un inmueble y su dirección física asociada al Tenant actual.' 
  })
  @ApiResponse({ status: 201, description: 'Propiedad creada correctamente.' })
  @ApiResponse({ status: 409, description: 'Código interno o Ref. Catastral duplicados.' })
  create(
    @Body() createDto: CreatePropertyDto, 
    @GetUser() user: any
  ) {
    const companyId = user.companyId;
    if (!companyId) throw new BadRequestException('Contexto de empresa requerido (Usa /company-context/select)');
    
    return this.propertyService.create(companyId, createDto);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar Propiedades', description: 'Devuelve todo el inventario de la empresa seleccionada.' })
  findAll(@GetUser() user: any) {
    const companyId = user.companyId;
    if (!companyId) throw new BadRequestException('Contexto de empresa requerido');
    
    return this.propertyService.findAll(companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de Propiedad' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser() user: any
  ) {
    return this.propertyService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar Propiedad' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePropertyDto,
    @GetUser() user: any,
  ) {
    return this.propertyService.update(id, user.companyId, updateDto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN) // ¿Permitimos borrar a USER normal? Quizás solo ADMIN.
  @ApiOperation({ 
    summary: 'Eliminar Propiedad', 
    description: 'Elimina el inmueble y su dirección. CUIDADO: Si hay contratos vinculados podría fallar (depende de FK).' 
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser() user: any
  ) {
    return this.propertyService.remove(id, user.companyId);
  }
}