import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBody,
} from '@nestjs/swagger';

import { FacturaeService } from './facturae.service';
import { CreateFacturaePartyDto } from './dto/createFacturaeParty.dto';
import { FacturaeParty } from './entities/facturaeParty.entity';

/**
 * FacturaeController
 *
 * Controlador responsable de la gestión de identidades fiscales
 * compatibles con el estándar Facturae (España).
 *
 * ⚠️ Importante:
 * - Este controlador NO crea empresas.
 * - Solo gestiona la entidad fiscal (FacturaeParty).
 * - Se usa como paso previo en el wizard de creación de empresa.
 *
 * Ruta base:
 *   /facturae-parties
 */
@ApiTags('Facturae')
@Controller('facturae-parties')
export class FacturaeController {
  constructor(
    private readonly facturaeService: FacturaeService,
  ) {}

  /**
   * Crear una identidad fiscal (FacturaeParty)
   *
   * Endpoint:
   *   POST /facturae-parties
   *
   * Uso principal:
   * - Paso intermedio del wizard de creación de empresa
   * - Se ejecuta ANTES de crear la empresa
   *
   * Responsabilidad:
   * - Validar los datos fiscales básicos
   * - Crear la entidad FacturaeParty
   * - Devolver la entidad persistida
   *
   * Notas de diseño:
   * - No asigna empresa
   * - No asigna usuarios
   * - No gestiona direcciones
   */
  @Post()
  @ApiOperation({
    summary: 'Crear identidad fiscal (FacturaeParty)',
    description: `
Crea una nueva identidad fiscal compatible con el estándar Facturae.

Este recurso representa a una persona física o jurídica
que puede emitir o recibir facturas conforme a la normativa española.

Se utiliza típicamente como paso previo
a la creación de una empresa o cliente.
    `,
  })
  @ApiBody({
    type: CreateFacturaePartyDto,
    description: 'Datos fiscales necesarios para crear una identidad Facturae',
  })
  @ApiCreatedResponse({
    description: 'Identidad fiscal creada correctamente',
    type: FacturaeParty,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o incompletos',
  })
  @ApiConflictResponse({
    description: 'Ya existe una identidad fiscal con el mismo taxId',
  })
  create(
    @Body() dto: CreateFacturaePartyDto,
  ): Promise<FacturaeParty> {
    return this.facturaeService.create(dto);
  }
}
