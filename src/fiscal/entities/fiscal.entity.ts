import { Column, Entity, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdType.enum';
import { ResidenceType } from '../enums/residenceType.enum';
import { Expose } from 'class-transformer';

/**
 * @description Entidad de Identidad Fiscal alineada con Veri*factu y FacturaE.
 * Centraliza la identificación legal para el encadenamiento de facturas.
 * @version 2026.2.0
 */
@Entity('fiscal_entities')
@Index('IDX_FISCAL_ENTITY_GLOBAL', ['nif'], {
  unique: true,
  where: 'company_id IS NULL',
})
@Index('IDX_FISCAL_ENTITY_TENANT', ['nif', 'companyId'], {
  unique: true,
  where: 'company_id IS NOT NULL',
})
export class FiscalEntity extends BaseEntity {
  /* ------------------------------------------------------------------
   * CONTEXTO MULTI-TENANT
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID de la empresa propietaria (Null si es global)',
  })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  /* ------------------------------------------------------------------
   * IDENTIFICACIÓN LEGAL (ESTÁNDAR AEAT)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'F (Física) o J (Jurídica)',
    enum: PersonType,
  })
  @Column({
    name: 'tipo_persona',
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
  })
  tipoPersona: PersonType;

  @ApiProperty({
    description: 'Tipo de documento (01: NIF, 02: Pasaporte...)',
    enum: TaxIdType,
  })
  @Column({
    name: 'tipo_id_fiscal',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  tipoIdFiscal: TaxIdType;

  @ApiProperty({
    description: 'NIF/CIF del obligado tributario',
    example: 'B12345678',
  })
  @Column({ name: 'nif', length: 20 })
  nif: string;

  /* ------------------------------------------------------------------
   * NOMBRES Y RAZÓN SOCIAL (UNIFICADO VERI*FACTU)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Nombre y Apellidos o Razón Social Completa',
    example: 'Rentix Solutions S.L.',
  })
  @Column({ name: 'nombre_razon_social' })
  nombreRazonSocial: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial (informativo)',
    example: 'Rentix App',
  })
  @Column({ name: 'nombre_comercial', nullable: true })
  nombreComercial?: string;

  /* ------------------------------------------------------------------
   * RESIDENCIA FISCAL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Residente (R), UE (U), Extra-UE (E)',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  @Column({
    name: 'tipo_residencia',
    type: 'enum',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  tipoResidencia: ResidenceType;

  @ApiProperty({
    description: 'Código ISO país (ESP)',
    example: 'ESP',
    default: 'ESP',
  })
  @Column({ name: 'codigo_pais', length: 3, default: 'ESP' })
  codigoPais: string;

  /* ------------------------------------------------------------------
   * RELACIONES
   * ------------------------------------------------------------------ */

  @OneToOne(() => Company, (company) => company.fiscalEntity)
  company: Company;

  /* ------------------------------------------------------------------
   * GETTERS DE NORMALIZACIÓN
   * ------------------------------------------------------------------ */

  /**
   * @description Retorna el nombre sanitizado para el nodo <NombreRazonSocial> del XML.
   */
  @Expose()
  @ApiProperty({ description: 'Nombre formateado para Veri*factu' })
  get nombreOficial(): string {
    return (this.nombreRazonSocial || 'DESCONOCIDO').trim().toUpperCase();
  }
}
