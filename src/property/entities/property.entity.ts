import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType, PropertyStatus, PropertyOrientation } from '../enums';

/**
 * Entidad Property (Asset Management).
 * Representa el activo físico inmobiliario alineado con estándares RESO y Schema.org.
 * * * Estándares Blueprint 2026:
 * - Aislamiento Multi-tenant: Filtrado por companyId indexado.
 * - Integridad: Índices compuestos para unicidad de códigos internos.
 * - Precisión: Transformers para manejo de tipos Decimal en PostgreSQL.
 * - Auditoría: Herencia nativa de BaseEntity (Soft-Delete habilitado).
 * * @version 1.2.1
 * @author Rentix
 */
@Entity('properties')
@Index('IDX_PROPERTY_COMPANY_CODE', ['companyId', 'internalCode'], { unique: true })
export class Property extends BaseEntity {

  /* --- IDENTIFICACIÓN LEGAL Y ORGANIZATIVA --- */

  @ApiProperty({ description: 'UUID de la organización propietaria' })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  /**
   * Relación jerárquica con la empresa propietaria.
   * Necesaria para resolver la relación inversa OneToMany en Company.
   */
  @ManyToOne(() => Company, (company) => company.properties)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ description: 'Código de referencia interno organizacional', example: 'P01-4A' })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiPropertyOptional({ description: 'Identificador oficial en el Catastro', example: '9876543VK4797S0001AY' })
  @Column({ name: 'cadastral_reference', length: 25, nullable: true })
  cadastralReference?: string;

  /* --- MÉTRICAS DE SUPERFICIE (ISO 9836) --- */

  @ApiProperty({ description: 'Superficie total construida en m²', example: 120.50 })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  surfaceTotal: number;

  @ApiProperty({ description: 'Superficie útil habitable en m²', example: 95.00 })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  surfaceUseful: number;

  /* --- ATRIBUTOS TÉCNICOS Y CONFORT --- */

  @ApiPropertyOptional({ description: 'Año de finalización de la construcción', example: 1998 })
  @Column({ type: 'int', nullable: true })
  constructionYear: number;

  @ApiPropertyOptional({ enum: PropertyOrientation, description: 'Orientación principal del inmueble' })
  @Column({ type: 'enum', enum: PropertyOrientation, nullable: true })
  orientation: PropertyOrientation;

  @ApiPropertyOptional({ description: 'Número de dormitorios (legales)', example: 3 })
  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @ApiPropertyOptional({ description: 'Número de baños completos', example: 2 })
  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  /* --- EFICIENCIA ENERGÉTICA --- */

  @ApiPropertyOptional({ description: 'Calificación energética (A-G)', example: 'B' })
  @Column({ name: 'energy_rating', length: 1, nullable: true })
  energyRating: string;

  @ApiPropertyOptional({ description: 'Consumo de energía primaria (kWh/m² año)', example: 45.2 })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  energyScore: number;

  /* --- DOTACIONES (AMENITIES) --- */

  @ApiProperty({ description: 'Indica si la finca dispone de ascensor', default: false })
  @Column({ default: false })
  hasElevator: boolean;

  @ApiProperty({ description: 'Indica si dispone de plaza de garaje vinculada', default: false })
  @Column({ default: false })
  hasParking: boolean;

  @ApiProperty({ description: 'Indica si dispone de trastero', default: false })
  @Column({ default: false })
  hasStorageRoom: boolean;

  @ApiProperty({ description: 'Indica si el inmueble posee terraza o balcón exterior', default: false })
  @Column({ default: false })
  hasTerrace: boolean;

  /* --- ESTADO Y LOCALIZACIÓN --- */

  @ApiProperty({ enum: PropertyType, description: 'Tipología funcional del activo' })
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus, description: 'Estado operativo actual', default: PropertyStatus.AVAILABLE })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @ApiProperty({ type: () => Address, description: 'Relación con la dirección física' })
  @OneToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}