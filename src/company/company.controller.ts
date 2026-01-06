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
import { CreateCompanyLegalDto } from './dto';

import { Company } from './entities/company.entity';

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
  constructor(private readonly companyService: CompanyService) {}

  /**
   * 🔹 Crear empresa (flujo legal completo)
   *
   * - Usa CreateCompanyLegalDto como contrato
   * - El DTO incluye ownerUserId
   * - Devuelve un resumen de la empresa creada
   */
  @Post('legal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  @ApiOperation({
    summary: 'Crear empresa (flujo legal completo)',
    description:
      'Crea empresa + identidad fiscal + dirección fiscal y asigna OWNER al usuario indicado',
  })
  @ApiCreatedResponse({
    description: 'Empresa creada correctamente',
    schema: {
      example: {
        id: 'uuid',
        legalName: 'Empresa Demo SL',
        taxId: 'B12345678',
      },
    },
  })
  createLegalCompany(
    @Body() dto: CreateCompanyLegalDto,
  ) {
    return this.companyService.createLegalCompany(dto);
  }

  /**
   * 🔹 Empresas del usuario autenticado
   *
   * - Devuelve solo empresas en las que participa
   * - Incluye rol por empresa
   */
  @Get('me')
  @ApiOperation({
    summary: 'Empresas del usuario autenticado',
    description:
      'Devuelve las empresas a las que pertenece el usuario junto con su rol',
  })
  @ApiOkResponse({
    description: 'Empresas del usuario',
    schema: {
      example: [
        {
          companyId: 'uuid',
          legalName: 'Empresa Demo SL',
          tradeName: 'Demo',
          role: 'OWNER',
        },
      ],
    },
  })
  getMyCompanies(@GetUser() user: User) {
    return this.companyService.getCompaniesForUser(user.id);
  }

  /**
   * 🔹 Listado completo de empresas (ADMIN / SUPERADMIN)
   *
   * Endpoint crítico para el front (listado).
   * Aquí es donde antes Swagger NO generaba content.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserGlobalRole.SUPERADMIN, UserGlobalRole.ADMIN)
  @ApiOperation({
    summary: 'Listado de empresas',
  })
  @ApiOkResponse({
    description: 'Listado completo de empresas',
    type: Company,
    isArray: true,
  })
  findAll() {
    return this.companyService.findAll();
  }
}
