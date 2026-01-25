import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { UserCompanyRoleService } from './user-company-role.service';
import { CreateUserCompanyRoleDto } from './dto/create-user-comany-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';
import { CompanyRoleEntity } from './entities/user-company-role.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class UserCompanyRoleController
 * @description Gestión de autoridad y multi-tenencia.
 * Alineado con el ciclo de vida Soft Delete (isActive + deletedAt).
 */
@ApiTags('User Company Roles')
@ApiBearerAuth()
@Auth(AppRole.SUPERADMIN, AppRole.ADMIN) // Solo perfiles de gestión pueden alterar roles
@Controller('user-company-role')
export class UserCompanyRoleController {
  constructor(
    private readonly userCompanyRoleService: UserCompanyRoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un nuevo rol a un usuario en una empresa' })
  @ApiCreatedResponse({ description: 'Vínculo creado exitosamente', type: CompanyRoleEntity })
  create(@Body() dto: CreateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    return this.userCompanyRoleService.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar todos los roles activos de un usuario' })
  @ApiOkResponse({ description: 'Lista de vínculos patrimoniales', type: [CompanyRoleEntity] })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<CompanyRoleEntity[]> {
    return this.userCompanyRoleService.findByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar privilegios o estado de empresa primaria' })
  @ApiOkResponse({ description: 'Vínculo actualizado', type: CompanyRoleEntity })
  @ApiNotFoundResponse({ description: 'No se encontró el vínculo' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserCompanyRoleDto,
  ): Promise<CompanyRoleEntity> {
    return this.userCompanyRoleService.update(id, dto);
  }

  /**
   * @method restore
   * @description Implementación Rentix 2026 para revertir el Soft Delete.
   */
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un vínculo previamente borrado (Soft Delete)' })
  @ApiOkResponse({ description: 'Vínculo reactivado', type: CompanyRoleEntity })
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyRoleEntity> {
    return this.userCompanyRoleService.restore(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Baja lógica del vínculo (Soft Delete)' })
  @ApiNoContentResponse({ description: 'Acceso revocado y marcado para borrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userCompanyRoleService.remove(id);
  }
}