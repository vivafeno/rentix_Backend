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

import { UserCompanyRoleService } from './companyRole.service';
import { CreateUserCompanyRoleDto } from './dto/createUuserCompanyRole.dto';
import { UpdateUserCompanyRoleDto } from './dto/updateUserCompanyRole.dto';
import { CompanyRoleEntity } from './entities/userCompanyRole.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AppRole } from 'src/auth/enums/user-global-role.enum';


@ApiTags('CompanyRole')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.SUPERADMIN, AppRole.ADMIN)
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
    type: CompanyRoleEntity,
  })
  create(
    @Body() dto: CreateUserCompanyRoleDto,
  ): Promise<CompanyRoleEntity> {
    return this.userCompanyRoleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vínculos usuario-empresa' })
  @ApiOkResponse({
    description: 'Lista de vínculos',
    type: CompanyRoleEntity,
    isArray: true,
  })
  findAll(): Promise<CompanyRoleEntity[]> {
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
    type: CompanyRoleEntity,
  })
  findOne(@Param('id') id: string): Promise<CompanyRoleEntity> {
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
    type: CompanyRoleEntity,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserCompanyRoleDto,
  ): Promise<CompanyRoleEntity> {
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
