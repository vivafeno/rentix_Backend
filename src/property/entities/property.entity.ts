import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType, PropertyStatus } from '../enums';


@Entity('properties')
@Index(['companyId'])
@Index(['reference'])
@Index(['cadastralReference'])
export class Property extends BaseEntity {

  /* ─────────────────────────────────────
   * MULTIEMPRESA
   * ───────────────────────────────────── */

  @ApiProperty({ description: 'Empresa propietaria del inmueble', format: 'uuid' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* ─────────────────────────────────────
   * DIRECCIÓN (Address.type = PROPERTY)
   * ───────────────────────────────────── */

  @ApiProperty({ description: 'Dirección asociada al inmueble', format: 'uuid' })
  @Column({ name: 'address_id', type: 'uuid' })
  addressId: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  /* ─────────────────────────────────────
   * IDENTIFICACIÓN
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Referencia interna del inmueble',
    example: 'P-VAL-001',
  })
  @Column({ nullable: true })
  reference?: string;

  @ApiProperty({
    description: 'Referencia catastral',
    example: '1234567AB1234C0001DE',
    required: false,
  })
  @Column({ name: 'cadastral_reference', nullable: true })
  cadastralReference?: string;

  /* ─────────────────────────────────────
   * TIPO Y ESTADO
   * ───────────────────────────────────── */

  @ApiProperty({
    enum: PropertyType,
    description: 'Tipo de inmueble',
  })
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @ApiProperty({
    enum: PropertyStatus,
    description: 'Estado actual del inmueble',
  })
  @Column({ type: 'enum', enum: PropertyStatus })
  status: PropertyStatus;

  /* ─────────────────────────────────────
   * DATOS FÍSICOS
   * ───────────────────────────────────── */

  @ApiProperty({ example: 85, required: false })
  @Column({ name: 'surface_m2', type: 'decimal', precision: 8, scale: 2, nullable: true })
  surfaceM2?: number;

  @ApiProperty({ example: 3, required: false })
  @Column({ nullable: true })
  rooms?: number;

  @ApiProperty({ example: 2, required: false })
  @Column({ nullable: true })
  bathrooms?: number;

  @ApiProperty({ example: '3º', required: false })
  @Column({ nullable: true })
  floor?: string;

  /* ─────────────────────────────────────
   * GEOLOCALIZACIÓN
   * ───────────────────────────────────── */

  @ApiProperty({ example: 39.4699, required: false })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiProperty({ example: -0.3763, required: false })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;
}
