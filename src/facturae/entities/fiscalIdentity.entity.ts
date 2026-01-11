import { Column, Entity, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from '../../common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';

// Reutilizamos tus Enums (asegúrate de que las rutas sean correctas)
import { PersonType } from '../enums/personType.enum'; 
import { TaxIdType } from '../enums/taxIdTtype.enum'; // Sugerencia: corregir typo taxIdTtype -> taxIdType
import { ResidenceType } from '../enums/residenceType.enum';

@Entity('fiscal_identities') // Nombre de tabla más limpio
@Index(['taxId'], { unique: true }) // El NIF/CIF debe ser único en el sistema
export class FiscalIdentity extends BaseEntity {

  /* ------------------------------------------------------------------
   * CLASIFICACIÓN (FÍSICA VS JURÍDICA)
   * Vital para decidir si generar tag <LegalEntity> o <Individual>
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Tipo de persona: F (Física/Autónomo) o J (Jurídica/Empresa)',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @Column({
    name: 'person_type',
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
  })
  personType: PersonType;

  /* ------------------------------------------------------------------
   * IDENTIFICADOR FISCAL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Tipo de documento (NIF, CIF, PASAPORTE, ETC)',
    enum: TaxIdType,
    example: TaxIdType.NIF,
  })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Número de identificación fiscal (Validado sintácticamente)',
    example: 'B12345678',
  })
  @Column({ name: 'tax_id', length: 20, unique: true })
  taxId: string;

  /* ------------------------------------------------------------------
   * DATOS NOMINATIVOS (Separados para Compliance)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Razón Social (Solo obligatorio si es Persona JURÍDICA)',
    example: 'Rentix Solutions S.L.',
  })
  @Column({ name: 'corporate_name', nullable: true })
  corporateName?: string; // Mapea a <CorporateName>

  @ApiPropertyOptional({
    description: 'Nombre de pila (Solo obligatorio si es Persona FÍSICA)',
    example: 'Juan',
  })
  @Column({ name: 'first_name', nullable: true })
  firstName?: string; // Mapea a <Name>

  @ApiPropertyOptional({
    description: 'Apellidos (Solo obligatorio si es Persona FÍSICA)',
    example: 'Pérez García',
  })
  @Column({ name: 'last_name', nullable: true })
  lastName?: string; // Mapea a <FirstSurname> + <SecondSurname>

  @ApiPropertyOptional({
    description: 'Nombre comercial (Marca conocida)',
    example: 'Rentix App',
  })
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  /* ------------------------------------------------------------------
   * DATOS FACTURAE (Contexto Fiscal)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Residencia fiscal (Residente, UE, Extranjero)',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  @Column({
    name: 'residence_type',
    type: 'enum',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  residenceType: ResidenceType;

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-3 (ESP, FRA, etc.) Recomendado 3 letras para Facturae XML.',
    example: 'ESP',
    default: 'ESP',
  })
  @Column({ name: 'country_code', length: 3, default: 'ESP' })
  countryCode: string;

  // NOTA: SubjectType y TaxRegime suelen ser calculados por factura o configuración, 
  // pero si quieres guardarlos por defecto aquí, puedes dejarlos. 
  // Los he simplificado para no sobrecargar la entidad base.

  /* ------------------------------------------------------------------
   * RELACIONES
   * ------------------------------------------------------------------ */

  @OneToOne(() => Company, (company) => company.facturaeParty)
  company: Company;
}