import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CreateCompanyDto, CompanyMeDto} from './dto';
import { Company } from './entities/company.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * ─────────────────────────────────────────────
   * Crear empresa (flujo desacoplado)
   *
   * PRECONDICIONES:
   * - facturaePartyId existe
   * - fiscalAddressId existe (DRAFT o ACTIVE)
   * - el usuario autenticado será OWNER
   *
   * El wizard del front controla el orden
   * ─────────────────────────────────────────────
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  @ApiOperation({
    summary: 'Crear empresa',
    description:
      'Crea una empresa vinculando una identidad fiscal y una dirección fiscal ya existentes',
  })
  @ApiCreatedResponse({
    description: 'Empresa creada correctamente',
    type: Company,
  })
  createCompany(
    @Body() dto: CreateCompanyDto,
    @GetUser() user: User,
  ): Promise<Company> {
    return this.companyService.createCompany(dto, user.id);
  }

  /**
   * ─────────────────────────────────────────────
   * Empresas del usuario autenticado
   * ─────────────────────────────────────────────
   */
  @Get('me')
  @ApiOperation({
    summary: 'Empresas del usuario autenticado',
    description:
      'Devuelve las empresas a las que pertenece el usuario junto con su rol',
  })
  @ApiOkResponse({
    description: 'Empresas del usuario',
    type: CompanyMeDto,
    isArray: true,
  })
  getMyCompanies(
    @GetUser() user: User,
  ): Promise<CompanyMeDto[]> {
    return this.companyService.getCompaniesForUser(user.id);
  }

  /**
   * ─────────────────────────────────────────────
   * Listado global de empresas
   * ─────────────────────────────────────────────
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  @ApiOperation({
    summary: 'Listado global de empresas',
    description: 'Devuelve todas las empresas del sistema',
  })
  @ApiOkResponse({
    description: 'Listado completo de empresas',
    type: Company,
    isArray: true,
  })
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }
}
