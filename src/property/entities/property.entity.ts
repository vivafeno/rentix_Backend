import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@Entity('properties')
@Index(['companyId', 'internalCode'], { unique: true })
@Index(['companyId', 'cadastralReference'])
export class Property extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🏢 MULTI-TENANT
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ type: () => Company, description: 'Empresa propietaria' })
  @ManyToOne(() => Company, (company) => company.properties, { 
    nullable: false, 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Column({ name: 'company_id' })
  companyId: string;

  /* ─────────────────────────────────────────────────────────────────
   * 📍 DIRECCIÓN
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ type: () => Address, description: 'Dirección física' })
  @OneToOne(() => Address, { 
    cascade: true, 
    eager: true,   
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  /* ─────────────────────────────────────────────────────────────────
   * 🆔 IDENTIFICACIÓN Y ESTADO
   * ───────────────────────────────────────────────────────────────── */
  @ApiProperty({ description: 'Código interno de gestión', example: 'P-001' })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiProperty({ description: 'Nombre comercial o alias', example: 'Ático Centro' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ 
    enum: PropertyType, 
    enumName: 'PropertyType', 
    example: PropertyType.RESIDENTIAL 
  })
  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.RESIDENTIAL })
  type: PropertyType;

  @ApiProperty({ 
    enum: PropertyStatus, 
    enumName: 'PropertyStatus', 
    example: PropertyStatus.AVAILABLE 
  })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ DATOS FISCALES / ECONÓMICOS
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ description: 'Referencia Catastral', maxLength: 20 })
  @Column({ name: 'cadastral_reference', length: 20, nullable: true })
  cadastralReference?: string;

  @ApiPropertyOptional({ description: 'Precio base sugerido', type: 'number' })
  @Column({ name: 'rent_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentPrice?: number;

  /* ─────────────────────────────────────────────────────────────────
   * 🏠 CARACTERÍSTICAS FÍSICAS
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ description: 'Metros cuadrados', type: 'number' })
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

  @ApiPropertyOptional({ description: 'Notas detalladas' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  /* ─────────────────────────────────────────────────────────────────
   * 🗺️ GEOLOCALIZACIÓN Y AUDITORÍA DE BORRADO
   * ───────────────────────────────────────────────────────────────── */
  @ApiPropertyOptional({ type: 'number' })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ type: 'number' })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

}