import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType, PropertyStatus, PropertyOrientation } from '../enums';

/**
 * @description Entidad Property (Gestión de Activos).
 * Representa el activo físico inmobiliario alineado con la normativa española.
 * @version 2026.2.0
 */
@Entity('properties')
@Index('IDX_PROPERTY_COMPANY_CODE', ['companyId', 'codigoInterno'], { unique: true })
export class Property extends BaseEntity {

  /* --- IDENTIFICACIÓN LEGAL Y ORGANIZATIVA --- */

  @ApiProperty({ description: 'UUID de la organización propietaria (Tenant Isolation)' })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.properties)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ description: 'Código de referencia interno (ej. P01-4A)', example: 'P01-4A' })
  @Column({ name: 'codigo_interno', length: 50 })
  codigoInterno: string; // 🚩 Sincronizado: internalCode -> codigoInterno

  @ApiPropertyOptional({ description: 'Referencia Catastral oficial (20 caracteres)', example: '9876543VK4797S0001AY' })
  @Column({ name: 'referencia_catastral', length: 25, nullable: true })
  referenciaCatastral?: string; // 🚩 Sincronizado: cadastralReference -> referenciaCatastral

  /* --- MÉTRICAS DE SUPERFICIE (ISO 9836) --- */

  @ApiProperty({ description: 'Superficie total construida en m²', example: 120.50 })
  @Column({
    name: 'superficie_construida',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  superficieConstruida: number;

  @ApiProperty({ description: 'Superficie útil habitable en m²', example: 95.00 })
  @Column({
    name: 'superficie_util',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  superficieUtil: number;

  /* --- ATRIBUTOS TÉCNICOS --- */

  @ApiPropertyOptional({ description: 'Año de construcción', example: 1998 })
  @Column({ name: 'año_construccion', type: 'int', nullable: true })
  anoConstruccion: number;

  @ApiPropertyOptional({ enum: PropertyOrientation, description: 'Orientación del inmueble' })
  @Column({ type: 'enum', enum: PropertyOrientation, nullable: true })
  orientacion: PropertyOrientation;

  @ApiPropertyOptional({ description: 'Número de dormitorios', example: 3 })
  @Column({ type: 'int', nullable: true })
  dormitorios: number;

  @ApiPropertyOptional({ description: 'Número de baños', example: 2 })
  @Column({ type: 'int', nullable: true })
  baños: number;

  /* --- EFICIENCIA ENERGÉTICA --- */

  @ApiPropertyOptional({ description: 'Calificación energética (A-G)', example: 'B' })
  @Column({ name: 'certificado_energetico', length: 1, nullable: true })
  certificadoEnergetico: string; // 🚩 Más claro para el usuario español

  /* --- DOTACIONES (AMENITIES) --- */

  @ApiProperty({ description: '¿Tiene ascensor?', default: false })
  @Column({ name: 'tiene_ascensor', default: false })
  tieneAscensor: boolean;

  @ApiProperty({ description: '¿Tiene plaza de garaje?', default: false })
  @Column({ name: 'tiene_parking', default: false })
  tieneParking: boolean;

  /* --- ESTADO Y LOCALIZACIÓN --- */

  @ApiProperty({ enum: PropertyType, description: 'Tipología del activo (Piso, Local, etc.)' })
  @Column({ type: 'enum', enum: PropertyType })
  tipo: PropertyType;

  @ApiProperty({ enum: PropertyStatus, description: 'Estado operativo', default: PropertyStatus.AVAILABLE })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  estado: PropertyStatus;

  /**
   * @description Relación con la dirección física.
   * Veri*factu: El inmueble DEBE tener dirección para ser facturable.
   */
  @ApiProperty({ type: () => Address, description: 'Dirección física del inmueble' })
  @OneToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}