import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { FiscalService } from './fiscal.service';
import { CreateFiscalDto } from './dto/create-fiscal.dto';
import { FiscalEntity } from './entities/fiscalEntity';
import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * @class FiscalIdentityController
 * @description Gestión de identidades fiscales compatibles con FacturaE y Veri*factu.
 * Actúa como orquestador del Wizard de cumplimiento legal para nuevas empresas.
 * @version 2026.2.0
 * @author Rentix
 */
@ApiTags('Fiscal Identities')
@ApiBearerAuth()
@Controller('fiscal-identities')
export class FiscalIdentityController {
  constructor(private readonly fiscalIdentityService: FiscalService) {}

  /**
   * @method create
   * @description Registra una nueva entidad fiscal validada.
   * Resuelve errores de "Unsafe assignment" mediante el uso de tipos de retorno explícitos.
   * @param {CreateFiscalDto} dto Datos de la entidad fiscal (NIF/CIF, Razón Social).
   * @returns {Promise<FiscalEntity>} Entidad fiscal persistida.
   */
  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Registrar nueva identidad fiscal (Wizard)',
    description: `
      Crea una entidad fiscal validada para Facturae España.
      Valida NIF/CIF y asegura coherencia entre tipo de persona y datos obligatorios.
    `,
  })
  @ApiBody({ type: CreateFiscalDto })
  @ApiCreatedResponse({
    description: 'Identidad fiscal registrada correctamente',
    type: FiscalEntity,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación en NIF o estructura.',
  })
  @ApiConflictResponse({ description: 'El NIF/CIF ya existe en el sistema.' })
  async create(@Body() dto: CreateFiscalDto): Promise<FiscalEntity> {
    // 🛡️ Forzamos el await para asegurar la resolución de la promesa antes de retornar
    // y evitar que el linter pierda la trazabilidad del tipo.
    return await this.fiscalIdentityService.create(dto);
  }
}
