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
import { MeDto } from './dto/me.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Users') // Estándar plural
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autenticado' })
@ApiForbiddenResponse({ description: 'Sin permisos suficientes' })
@Controller('users') // Estándar plural
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario (Solo Admin/SuperAdmin)' })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente',
    type: UserDto,
  })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Get()
  @Auth(AppRole.SUPERADMIN) // Solo el dueño del sistema lista a todos
  @ApiOperation({
    summary: 'Listar todos los usuarios activos (Solo SuperAdmin)',
  })
  @ApiOkResponse({ description: 'Listado de usuarios', type: [UserDto] })
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Get('me')
  @Auth() // Cualquier usuario autenticado puede ver sus datos
  @ApiOperation({ summary: 'Obtener datos del usuario logueado' })
  @ApiOkResponse({ description: 'Datos del usuario autenticado', type: MeDto })
  getMe(@GetUser('id') userId: string): Promise<MeDto> {
    // Usamos el ID del token para buscar en DB y devolver el DTO completo
    return this.userService.findMe(userId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiOkResponse({ description: 'Usuario encontrado', type: UserDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiOkResponse({ description: 'Usuario actualizado', type: UserDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Auth(AppRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
  @ApiNoContentResponse({ description: 'Usuario desactivado correctamente' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
