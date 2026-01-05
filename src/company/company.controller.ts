import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CreateCompanyLegalDto } from './dto/create-company-legal.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';


@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post('legal')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear empresa (flujo legal completo)',
    description: 'Crea empresa + identidad fiscal + dirección fiscal y asigna OWNER al creador',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  createLegalCompany(
    @Body() dto: CreateCompanyLegalDto,
    @GetUser() user: User,
  ) {
    return this.companyService.createLegalCompany(dto, user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Empresas del usuario autenticado',
    description: 'Devuelve las empresas a las que pertenece el usuario con su rol',
  })
  @UseGuards(JwtAuthGuard)
  getMyCompanies(@GetUser() user: User) {
    return this.companyService.getCompaniesForUser(user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  findAll() {
    return this.companyService.findAll();
  }


}
