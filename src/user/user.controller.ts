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
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { MeDto } from './dto/me.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 🔹 Crear un nuevo usuario
   * Solo accesible para ADMIN / SUPERADMIN
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente',
    type: UserDto,
  })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  /**
   * 🔹 Listar todos los usuarios activos
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios activos' })
  @ApiOkResponse({
    description: 'Listado de usuarios',
    type: UserDto,
    isArray: true,
  })
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  /**
   * 🔹 Datos del usuario autenticado
   * Endpoint crítico para el front
   */
  @Get('me')
  @Roles(
    UserGlobalRole.SUPERADMIN,
    UserGlobalRole.ADMIN,
    UserGlobalRole.USER,
  )
  @ApiOperation({ summary: 'Usuario autenticado (me)' })
  @ApiOkResponse({
    description: 'Datos del usuario autenticado',
    type: MeDto,
  })
  getMe(@GetUser() user: { id: string }): Promise<MeDto> {
    return this.userService.findMe(user.id);
  }

  /**
   * 🔹 Obtener usuario por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: 'c3f6c9c1-9e9a-4a4b-8f88-3b8b9e7b6c21',
  })
  @ApiOkResponse({
    description: 'Usuario',
    type: UserDto,
  })
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  /**
   * 🔹 Actualizar un usuario
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Usuario actualizado',
    type: UserDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  /**
   * 🔹 Desactivar un usuario (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
  })
  @ApiOkResponse({
    description: 'Usuario desactivado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuario desactivado correctamente',
        },
      },
    },
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }
}
