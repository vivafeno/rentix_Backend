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
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * @class UserController
 * @description Punto de entrada para la gestión de identidades y perfiles.
 * Implementa seguridad jerárquica y documentación OpenAPI 3.0.
 */
@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autenticado' })
@ApiForbiddenResponse({ description: 'Sin permisos suficientes' })
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Alta de usuario administrativa' })
  @ApiCreatedResponse({ description: 'Usuario creado', type: UserDto })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listar ecosistema de usuarios (Solo SuperAdmin)' })
  @ApiOkResponse({ description: 'Listado global', type: [UserDto] })
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  /**
   * @description Endpoint crítico para el arranque del Frontend Angular.
   * Proporciona el perfil, idioma, onboarding y roles patrimoniales.
   */
  @Get('me')
  @Auth() 
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({ description: 'Perfil actual', type: UserDto })
  getMe(@GetUser('id') userId: string): Promise<UserDto> {
    return this.userService.findMe(userId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Consultar usuario por UUID' })
  @ApiOkResponse({ description: 'Usuario localizado', type: UserDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Actualización administrativa de usuario' })
  @ApiOkResponse({ description: 'Cambios aplicados', type: UserDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Baja lógica de usuario (Soft Delete)' })
  @ApiNoContentResponse({ description: 'Usuario desactivado y marcado como borrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}