import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserCompanyRoleService } from './user-company-role.service';
import { CreateUserCompanyRoleDto } from './dto/create-user-company-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';
import { UserCompanyRole } from './entities/user-company-role.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('UserCompanyRole')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
@Controller('user-company-role')
export class UserCompanyRoleController {
  constructor(private readonly userCompanyRoleService: UserCompanyRoleService) {}

  @ApiOperation({ summary: 'Crear vínculo de usuario-empresa con rol' })
  @ApiBody({ type: CreateUserCompanyRoleDto })
  @ApiResponse({ status: 201, description: 'Vínculo creado', type: UserCompanyRole })
  @Post()
  create(@Body() createUserCompanyRoleDto: CreateUserCompanyRoleDto) {
    return this.userCompanyRoleService.create(createUserCompanyRoleDto);
  }

  @ApiOperation({ summary: 'Listar todos los vínculos usuario-empresa' })
  @ApiResponse({ status: 200, description: 'Lista de vínculos', type: [UserCompanyRole] })
  @Get()
  findAll() {
    return this.userCompanyRoleService.findAll();
  }

  @ApiOperation({ summary: 'Obtener vínculo usuario-empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del vínculo', required: true })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado', type: UserCompanyRole })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userCompanyRoleService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar vínculo usuario-empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del vínculo', required: true })
  @ApiBody({ type: UpdateUserCompanyRoleDto })
  @ApiResponse({ status: 200, description: 'Vínculo actualizado', type: UserCompanyRole })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserCompanyRoleDto: UpdateUserCompanyRoleDto) {
    return this.userCompanyRoleService.update(id, updateUserCompanyRoleDto);
  }

  @ApiOperation({ summary: 'Eliminar vínculo usuario-empresa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del vínculo', required: true })
  @ApiResponse({ status: 200, description: 'Vínculo eliminado', type: UserCompanyRole })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userCompanyRoleService.remove(id);
  }
}
