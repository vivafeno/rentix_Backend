import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType, PropertyStatus, PropertyOrientation } from '../enums';

/**
 * @class Property
 * @description Entidad core de activos inmobiliarios Rentix 2026.
 * Implementa estándares de precisión para superficies y cumplimiento normativo.
 */
@Entity('properties')
@Index('IDX_PROPERTY_COMPANY_CODE', ['companyId', 'internalCode'], { unique: true })
export class Property extends BaseEntity {

  /* --- INFRAESTRUCTURA Y TENANT --- */

  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company, (company) => company.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  /* --- IDENTIFICACIÓN Y CATASTRO --- */

  @ApiProperty({ description: 'Referencia interna única por empresa', example: 'P-101' })
  @Column({ name: 'internal_code', type: 'varchar', length: 50 })
  internalCode!: string;

  @ApiPropertyOptional({ description: 'Referencia Catastral (20 caracteres)', example: '9876543VK4797S0001AY' })
  @Column({ name: 'cadastral_reference', type: 'varchar', length: 20, nullable: true })
  cadastralReference?: string;

  /* --- MÉTRICAS Y SUPERFICIES (Contraste ISO) --- */

  // Nota: Usamos transformer para que los decimales de Postgres vuelvan como Numbers en JS
  @Column({
    name: 'built_area',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseFloat(v) }
  })
  builtArea!: number;

  @Column({
    name: 'useful_area',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v) => v, from: (v) => parseFloat(v) }
  })
  usefulArea!: number;

  @ApiPropertyOptional({ description: 'Metros de terraza/balcón', example: 12.5 })
  @Column({
    name: 'outdoor_area',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { to: (v) => v, from: (v) => parseFloat(v) }
  })
  outdoorArea!: number;

  /* --- ESPECIFICACIONES TÉCNICAS --- */

  @Column({ name: 'construction_year', type: 'int', nullable: true })
  constructionYear!: number;

  @Column({ type: 'enum', enum: PropertyOrientation, nullable: true })
  orientation!: PropertyOrientation;

  @Column({ type: 'int', default: 0 })
  bedrooms!: number;

  @Column({ type: 'int', default: 0 })
  bathrooms!: number;

  // 🚩 SOLUCIÓN AL ERROR: Cambiado de 'string' a 'varchar'
  @ApiPropertyOptional({ description: 'Piso o planta', example: '4º-B' })
  @Column({ name: 'floor_number', type: 'varchar', length: 20, nullable: true })
  floorNumber!: string;

  /* --- EFICIENCIA Y SUMINISTROS (Contraste AEAT) --- */

  @Column({ name: 'energy_certificate', type: 'varchar', length: 2, nullable: true })
  energyCertificate!: string;

  @Column({
    name: 'energy_consumption',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { to: (v) => v, from: (v) => parseFloat(v) }
  })
  energyConsumption!: number;

  /* --- DOTACIONES Y EQUIPAMIENTO --- */

  @Column({ name: 'has_elevator', type: 'boolean', default: false })
  hasElevator!: boolean;

  @Column({ name: 'has_parking', type: 'boolean', default: false })
  hasParking!: boolean;

  @Column({ name: 'has_storage_room', type: 'boolean', default: false })
  hasStorageRoom!: boolean;

  @Column({ name: 'is_furnished', type: 'boolean', default: false })
  isFurnished!: boolean;

  /* --- ESTADO Y TIPO --- */

  @Column({ type: 'enum', enum: PropertyType })
  type!: PropertyType;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status!: PropertyStatus;


  @Column({ name: 'address_id', type: 'uuid' })
  addressId!: string;

  /* --- RELACIONES --- */


  @OneToOne(() => Address, { cascade: true, eager: true, nullable: false })
  @JoinColumn({ name: 'address_id' })
  address!: Address;
}