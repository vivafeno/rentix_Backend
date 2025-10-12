import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MeDto } from './dto/me.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, type: UserDto })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios activos' })
  @ApiResponse({ status: 200, type: [UserDto] })
  @Roles('superadmin')
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  // 👇 mover "me" ANTES de ":id"
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: MeDto })
  @Get('me')
  getMe(@GetUser('sub') userId: string) {
    return this.userService.findMe(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, type: UserDto })
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, type: UserDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Usuario desactivado correctamente' } } })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
