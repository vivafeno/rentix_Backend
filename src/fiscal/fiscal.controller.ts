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

import { FiscalIdentityService } from './fiscal.service';
import { CreateFiscalEntityDto } from './dto/create-fiscal.dto';
import { FiscalEntity } from './entities/fiscalEntity';

import { Auth } from 'src/auth/decorators/auth.decorator';

/**
 * FiscalIdentityController
 *
 * Gestión de identidades fiscales para Facturae (España).
 * * Contexto:
 * Este controlador es el paso intermedio del Wizard de creación de empresa.
 * Recibe datos fiscales validados y genera una identidad única (NIF) en el sistema.
 */
@ApiTags('Fiscal Identities') // Nombre más claro y estándar
@ApiBearerAuth()
@Controller('fiscal-identities') // RESTful: recurso en plural y guiones
export class FiscalIdentityController {
  constructor(
    private readonly fiscalIdentityService: FiscalIdentityService,
  ) {}

  /**
   * Crear una identidad fiscal
   * * Paso del Wizard:
   * 1. User (creado) -> 2. Address (creado) -> 3. **FiscalIdentity** -> 4. Company
   */
  @Post()
  @Auth() // 👈 Seguridad: Solo usuarios registrados pueden iniciar este trámite
  @ApiOperation({
    summary: 'Registrar nueva identidad fiscal (Wizard)',
    description: `
      Crea una entidad fiscal validada para Facturae España.
      
      - Valida formato NIF/CIF.
      - Asegura coherencia entre Persona Física (Nombre/Apellidos) vs Jurídica (Razón Social).
      - Sanitiza la entrada para cumplir estándares XML.
    `,
  })
  @ApiBody({ type: CreateFiscalEntityDto })
  @ApiCreatedResponse({
    description: 'Identidad fiscal registrada correctamente',
    type: FiscalEntity,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación (ej: Falta Razón Social en empresa o NIF inválido)',
  })
  @ApiConflictResponse({
    description: 'El NIF/CIF ya está registrado en el sistema',
  })
  create(
    @Body() dto: CreateFiscalEntityDto,
  ): Promise<FiscalEntity> {
    return this.fiscalIdentityService.create(dto);
  }
}