import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'JWT no válido o expirado.' })
@ApiForbiddenResponse({ description: 'Privilegios insuficientes.' })
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * @description ALTA ATÓMICA (Contexto SUPERADMIN).
   * El SA crea la infraestructura y asigna al dueño legal.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Alta atómica de Patrimonio (SA)' })
  @ApiCreatedResponse({ type: Company })
  async create(@Body() dto: CreateCompanyLegalDto): Promise<Company> {
    // Por defecto, el SA crea el nodo raíz (OWNER)
    return await this.companyService.createCompany(dto, CompanyRole.OWNER);
  }

  /**
   * @description LISTADO DINÁMICO.
   * Si eres SA, ves TODO (incluído suspendidos). Si eres USER, solo tus activas.
   */
  @Get()
  @Auth()
  @ApiOperation({ summary: 'Listado de empresas (Contextual)' })
  @ApiOkResponse({ type: [Company] })
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company[]> {
    return await this.companyService.findAll(userId, appRole);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Detalle técnico y legal de empresa' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company> {
    return await this.companyService.findOne(id, userId, appRole);
  }

  /**
   * @description KILL-SWITCH / REACTIVACIÓN (Exclusivo SA).
   * Maneja el estado isActive y el borrado lógico en una sola operación.
   */
  @Patch(':id/status')
  @Auth(AppRole.SUPERADMIN)
  @ApiOperation({ summary: 'Alternar estado operativo (Activar/Suspender) - SA' })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<Company> {
    return await this.companyService.toggleStatus(id, isActive);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualización parcial de metadatos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
    @GetUser('id') userId: string,
    @GetUser('appRole') appRole: AppRole,
  ): Promise<Company> {
    return await this.companyService.update(id, updateDto, userId, appRole);
  }

  /**
   * @description BORRADO FÍSICO (Opcional, solo SA).
   * En 2026 preferimos toggleStatus para trazabilidad Veri*factu.
   */
  @Delete(':id/permanent')
  @Auth(AppRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminación permanente de DB (SA)' })
  async hardDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    // Implementar solo si es estrictamente necesario, si no, usar toggleStatus(false)
  }
}