import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { UserCompanyRoleService } from './userCompanyRole.service';
import { CreateUserCompanyRoleDto } from './dto/createUuserCompanyRole.dto';
import { UpdateUserCompanyRoleDto } from './dto/updateUserCompanyRole.dto';
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

  @Post()
  @ApiOperation({ summary: 'Crear vínculo de usuario-empresa con rol' })
  @ApiBody({ type: CreateUserCompanyRoleDto })
  @ApiCreatedResponse({
    description: 'Vínculo creado',
    type: UserCompanyRole,
  })
  create(
    @Body() dto: CreateUserCompanyRoleDto,
  ): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vínculos usuario-empresa' })
  @ApiOkResponse({
    description: 'Lista de vínculos',
    type: UserCompanyRole,
    isArray: true,
  })
  findAll(): Promise<UserCompanyRole[]> {
    return this.userCompanyRoleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiOkResponse({
    description: 'Vínculo encontrado',
    type: UserCompanyRole,
  })
  findOne(@Param('id') id: string): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiBody({ type: UpdateUserCompanyRoleDto })
  @ApiOkResponse({
    description: 'Vínculo actualizado',
    type: UserCompanyRole,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserCompanyRoleDto,
  ): Promise<UserCompanyRole> {
    return this.userCompanyRoleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar vínculo usuario-empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del vínculo',
  })
  @ApiNoContentResponse({
    description: 'Vínculo eliminado correctamente',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userCompanyRoleService.remove(id);
  }
}
