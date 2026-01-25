import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BillingConceptService } from './billing-concept.service';
import { CreateBillingConceptDto } from './dto/create-billing-concept.dto';
import { UpdateBillingConceptDto } from './dto/update-billing-concept.dto';
import { BillingConcept } from './entities/billing-concept.entity';
import { AppRole } from '../auth/enums/user-global-role.enum';
import { CompanyRole } from '../user-company-role/enums/user-company-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

/**
 * @class BillingConceptController
 * @description Controlador para la gestión del catálogo maestro de conceptos de facturación.
 * @version 2026.1.18
 * @author Rentix
 */
@ApiTags('Billing Concepts')
@ApiBearerAuth()
@Controller('billing-concept')
export class BillingConceptController {
  constructor(private readonly service: BillingConceptService) {}

  /**
   * @method create
   * @description Registra un nuevo concepto en el catálogo.
   * @param {CreateBillingConceptDto} createDto Datos del concepto.
   * @returns {Promise<BillingConcept>}
   */
  @Post()
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Crear concepto en el catálogo maestro' })
  @ApiResponse({ status: 201, type: BillingConcept })
  async create(
    @Body() createDto: CreateBillingConceptDto,
  ): Promise<BillingConcept> {
    return await this.service.create(createDto);
  }

  /**
   * @method findAll
   * @description Recupera el catálogo completo de conceptos activos.
   * @returns {Promise<BillingConcept[]>}
   */
  @Get()
  @Roles(
    AppRole.SUPERADMIN,
    AppRole.ADMIN,
    AppRole.USER,
    CompanyRole.OWNER,
    CompanyRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Listar catálogo (Accesible para todos los roles de lectura)',
  })
  @ApiResponse({ status: 200, type: [BillingConcept] })
  async findAll(): Promise<BillingConcept[]> {
    return await this.service.findAll();
  }

  /**
   * @method update
   * @description Actualiza una plantilla de concepto existente.
   */
  @Patch(':id')
  @Roles(AppRole.SUPERADMIN, AppRole.ADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Actualizar plantilla de concepto' })
  @ApiResponse({ status: 200, type: BillingConcept })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBillingConceptDto,
  ): Promise<BillingConcept> {
    return await this.service.update(id, updateDto);
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico de un concepto del catálogo.
   */
  @Delete(':id')
  @Roles(AppRole.SUPERADMIN, CompanyRole.OWNER)
  @ApiOperation({
    summary: 'Soft Delete de un concepto (Solo SuperAdmin u Owner)',
  })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
