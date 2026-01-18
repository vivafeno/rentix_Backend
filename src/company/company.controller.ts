import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * @class CompanyController
 * @description Controlador de orquestación patrimonial (Rentix 2026).
 * Gestiona el ciclo de vida de las empresas y sus entidades legales bajo
 * estándares Veri*factu para garantizar la trazabilidad fiscal.
 * @author Rentix 2026
 * @version 2.3.1
 */
@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Error de autenticación: Token JWT no válido o expirado.',
})
@ApiForbiddenResponse({
  description:
    'Error de autorización: El rol del usuario no permite esta acción.',
})
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * @method createOwner
   * @description Ejecuta el alta atómica de una nueva empresa vinculada a un propietario.
   * Restringido a SUPERADMIN para control de creación de nuevos patrimonios raíz.
   * @param {CreateCompanyLegalDto} dto - Estructura Veri*factu compliant (Fiscal + Address).
   * @returns {Promise<Company>}
   */
  @Post('owner')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Alta atómica de Propietario (Owner)',
    description:
      'Genera Address, FiscalEntity y Company en una transacción única.',
  })
  @ApiCreatedResponse({
    description: 'Empresa y registros legales creados con éxito.',
    type: Company,
  })
  async createOwner(@Body() dto: CreateCompanyLegalDto): Promise<Company> {
    return await this.companyService.createOwner(dto);
  }

  /**
   * @method createTenant
   * @description Registra un nuevo arrendatario con su estructura legal propia.
   * @param {CreateCompanyLegalDto} dto - Datos de identidad fiscal del inquilino.
   */
  @Post('tenant')
  @Auth()
  @ApiOperation({ summary: 'Alta atómica de Arrendatario (Tenant)' })
  async createTenant(@Body() dto: CreateCompanyLegalDto): Promise<Company> {
    return await this.companyService.createTenant(dto);
  }

  /**
   * @method getMyCompanies
   * @description Punto de entrada para el Dashboard.
   * Recupera el inventario de empresas accesibles con validación de tipos estricta.
   * @param {string} userId - ID del usuario extraído del JWT.
   * @param {AppRole} appRole - Rol global para determinar visibilidad.
   */
  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Listado de patrimonios vinculados',
    description:
      'Visión global para SUPERADMIN y filtrada por jerarquía para USER/ADMIN.',
  })
  @ApiResponse({
    status: 200,
    type: [Company],
    description: 'Colección de empresas recuperada.',
  })
  async getMyCompanies(
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company[]> {
    // 🛡️ Casting explícito a AppRole para satisfacer TS2345
    return await this.companyService.findAllByUser(userId, appRole);
  }

  /**
   * @method findOne
   * @description Recupera el detalle técnico y legal de una empresa.
   * @param {string} id - UUID de la empresa.
   */
  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Detalle de empresa con validación de acceso' })
  @ApiParam({ name: 'id', description: 'UUID del patrimonio.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company> {
    return await this.companyService.findOne(id, userId, appRole);
  }

  /**
   * @method update
   * @description Actualización parcial de los metadatos de una empresa.
   */
  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualización de metadatos de empresa' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company> {
    return await this.companyService.update(id, updateDto, userId, appRole);
  }

  /**
   * @method remove
   * @description Baja lógica de la empresa (Soft Delete).
   * Restringido a SUPERADMIN por impacto en trazabilidad fiscal.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Baja lógica de empresa' })
  @ApiResponse({
    status: 204,
    description: 'Empresa marcada como eliminada correctamente.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<void> {
    return await this.companyService.remove(id, userId, appRole);
  }
}
