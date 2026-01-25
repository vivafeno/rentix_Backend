import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class TaxController
 * @description Orquestador del catálogo impositivo (IVA/IRPF).
 * Garantiza el cumplimiento de Veri*factu mediante el aislamiento de contextos fiscales.
 * @author Rentix 2026
 * @version 2.2.0
 */
@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('taxes')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * @method create
   * @description Registra un nuevo tipo impositivo.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Crear un nuevo impuesto' })
  @ApiResponse({ status: 201, type: Tax })
  async create(
    @Body() createTaxDto: CreateTaxDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Tax> {
    this.checkContext(companyId);
    return this.taxService.create(companyId, createTaxDto);
  }

  /**
   * @method findAll
   * @description Lista los impuestos operativos para la empresa actual.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar impuestos activos de la empresa' })
  @ApiResponse({ status: 200, type: [Tax] })
  async findAll(@GetUser('companyId') companyId: string): Promise<Tax[]> {
    this.checkContext(companyId);
    return this.taxService.findAll(companyId);
  }

  /**
   * @method findAllDeleted
   * @description Recupera el histórico de impuestos dados de baja (Papelera).
   */
  @Get('trash')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar impuestos eliminados (Papelera)' })
  @ApiResponse({ status: 200, type: [Tax] })
  async findAllDeleted(
    @GetUser('companyId') companyId: string,
  ): Promise<Tax[]> {
    this.checkContext(companyId);
    return this.taxService.findAllDeleted(companyId);
  }

  /**
   * @method findOne
   * @description Detalle técnico de un impuesto.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<Tax> {
    this.checkContext(companyId);
    return this.taxService.findOne(id, companyId);
  }

  /**
   * @method update
   * @description Modificación parcial de la configuración impositiva.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar un impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaxDto: UpdateTaxDto,
    @GetUser('companyId') companyId: string,
  ): Promise<Tax> {
    this.checkContext(companyId);
    return this.taxService.update(id, companyId, updateTaxDto);
  }

  /**
   * @method restore
   * @description Reactiva un impuesto de la papelera. Solo OWNER/REPRESENTATIVE.
   */
  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Restaurar un impuesto de la papelera' })
  @ApiResponse({ status: 200, type: Tax })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Tax> {
    this.checkContext(companyId);
    return this.taxService.restore(id, companyId, companyRole);
  }

  /**
   * @method remove
   * @description Baja lógica de un impuesto. Solo OWNER/REPRESENTATIVE.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Borrado lógico de impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Tax> {
    this.checkContext(companyId);
    return this.taxService.remove(id, companyId, companyRole);
  }

  /**
   * @private
   * @description Validación de blindaje multi-tenant.
   */
  private checkContext(companyId?: string): void {
    if (!companyId) {
      throw new BadRequestException(
        'Contexto de patrimonio (companyId) no detectado en la sesión.',
      );
    }
  }
}
