import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * DTO para la creación de una empresa.
 *
 * ⚠️ IMPORTANTE:
 * - Este DTO NO crea entidades hijas.
 * - Consume identificadores previamente creados
 *   durante el flujo wizard del frontend.
 *
 * Flujo esperado:
 * 1. Crear FacturaeParty → obtiene facturaePartyId
 * 2. Crear Address en estado DRAFT → obtiene fiscalAddressId
 * 3. Crear Company usando este DTO
 */
export class CreateCompanyDto {

  @ApiProperty({
    description: `
Identificador de la identidad fiscal de la empresa (FacturaeParty).

Debe existir previamente y haber sido creada
en un paso anterior del flujo.
`,
    format: 'uuid',
    example: 'a7c9b2e1-1234-4cde-9a88-ffeeddccbbaa',
  })
  @IsUUID()
  facturaePartyId: string;

  @ApiProperty({
    description: `
Identificador de la dirección fiscal de la empresa.

La dirección debe existir previamente y estar en estado DRAFT.
Durante la creación de la empresa se asociará
y pasará a estado ACTIVE.
`,
    format: 'uuid',
    example: 'b8d1c9a2-5678-4fbc-8123-aabbccddeeff',
  })
  @IsUUID()
  fiscalAddressId: string;
}
