import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany, // 👈 Nuevo import
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

// 👇 DESCOMENTAR MAÑANA CUANDO TENGAMOS EL CONTRATO
// import { Contract } from 'src/contract/entities/contract.entity';

/**
 * 🏠 PROPERTY (Inmueble / Activo)
 * Representa la unidad física alquilable.
 * - Pertenece a una Empresa (Tenant).
 * - Tiene una Dirección única.
 * - Puede tener N Contratos históricos, pero solo 1 ACTIVO simultáneamente.
 */
@Entity('properties')
@Index(['companyId', 'internalCode'], { unique: true })
@Index(['companyId', 'cadastralReference'])
export class Property extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🏢 MULTI-TENANT (Owner)
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ type: () => Company })
  @ManyToOne(() => Company, (company) => company.properties, { 
    nullable: false, 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'company_id' })
  companyId: string;

  /* ─────────────────────────────────────────────────────────────────
   * 📍 DIRECCIÓN
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ type: () => Address })
  @OneToOne(() => Address, { 
    cascade: true, 
    eager: true,   
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  /* ─────────────────────────────────────────────────────────────────
   * 📜 CONTRATOS (Relación con el futuro módulo)
   * ───────────────────────────────────────────────────────────────── */
  
  // 👇 DESCOMENTAR MAÑANA: Relación OneToMany para historial.
  // La validación "Solo 1 activo" se hará en el Service de Contract.
  /*
  @OneToMany(() => Contract, (contract) => contract.property)
  contracts: Contract[];
  */

  /* ─────────────────────────────────────────────────────────────────
   * 🆔 IDENTIFICACIÓN
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ description: 'Código interno único', example: 'P-001' })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiProperty({ description: 'Alias amigable', example: 'Ático Centro' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.RESIDENTIAL })
  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.RESIDENTIAL })
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.AVAILABLE })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ DATOS FACTURAE
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ description: 'Referencia Catastral', maxLength: 20 })
  @Column({ name: 'cadastral_reference', length: 20, nullable: true })
  cadastralReference?: string;

  @ApiPropertyOptional({ description: 'Precio alquiler sugerido', type: 'number' })
  @Column({ name: 'rent_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentPrice?: number;

  /* ─────────────────────────────────────────────────────────────────
   * 🏠 CARACTERÍSTICAS FÍSICAS
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ description: 'Superficie m2', type: 'number' })
  @Column({ name: 'surface_m2', type: 'decimal', precision: 8, scale: 2, nullable: true })
  surfaceM2?: number;

  @ApiPropertyOptional({ example: 3 })
  @Column({ type: 'int', nullable: true })
  rooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @ApiPropertyOptional({ example: '3º Izq' })
  @Column({ length: 20, nullable: true })
  floor?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  /* ─────────────────────────────────────────────────────────────────
   * 🗺️ GEO
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ type: 'number' })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ type: 'number' })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;
}