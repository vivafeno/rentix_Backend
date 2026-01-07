import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UserCompanyRoleService } from './userCompanyRole.service';
import { CreateUserCompanyRoleDto, UpdateUserCompanyRoleDto } from './dto';
import { UserCompanyRole } from './entities/userCompanyRole.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('UserCompanyRole')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
@Controller('user-company-role')
export class UserCompanyRoleController {
  constructor(
    private readonly userCompanyRoleService: UserCompanyRoleService,
  ) {}

  /**
   * Crear vínculo usuario-empresa con rol
   */
  @Post()
  @ApiOperation({ summary: 'Crear vínculo de usuario-empresa con rol' })
  @ApiBody({ type: CreateUserCompanyRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Vínculo creado',
    type: UserCompanyRole,
  })
  create(
    @Body() dto: CreateUserCompanyRoleDto,
  ): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.create(dto);
  }

  /**
   * Listar todos los vínculos usuario-empresa
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los vínculos usuario-empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vínculos',
    type: UserCompanyRole,
    isArray: true,
  })
  findAll(): Promise<UserCompanyRole[]> {
    return this.userCompanyRoleService.findAll();
  }

  /**
   * Obtener vínculo usuario-empresa por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiResponse({
    status: 200,
    description: 'Vínculo encontrado',
    type: UserCompanyRole,
  })
  @ApiResponse({
    status: 404,
    description: 'No encontrado',
  })
  findOne(@Param('id') id: string): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.findOne(id);
  }

  /**
   * Actualizar vínculo usuario-empresa
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiBody({ type: UpdateUserCompanyRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Vínculo actualizado',
    type: UserCompanyRole,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserCompanyRoleDto,
  ): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.update(id, dto);
  }

  /**
   * Eliminar vínculo usuario-empresa
   *
   * ⚠️ Respuesta explícita para OpenAPI / Frontend
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiResponse({
    status: 200,
    description: 'Vínculo eliminado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Vínculo eliminado correctamente',
        },
      },
    },
  })
  remove(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.userCompanyRoleService.remove(id);
  }
}
