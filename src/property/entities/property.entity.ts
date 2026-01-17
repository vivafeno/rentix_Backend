import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@Entity('properties')
@Index('IDX_PROPERTY_COMPANY_CODE', ['companyId', 'internalCode'], { unique: true })
@Index('IDX_PROPERTY_COMPANY_CADASTRAL', ['companyId', 'cadastralReference'])
export class Property extends BaseEntity {

  /* --- 1. IDENTIFICADORES Y RELACIONES (UUIDs / Fixed 16b) --- */

  @ApiProperty({ 
    description: 'Identificador de la organización propietaria', 
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' 
  })
  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId: string;

  @ApiProperty({ type: () => Company, description: 'Relación jerárquica con la empresa' })
  @ManyToOne(() => Company, (company) => company.properties, { 
    nullable: false, 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /**
   * Identificador físico de la dirección. 
   * 🚨 CRUCIAL: Mantiene el vínculo persistente aunque el objeto address falle al cargar.
   */
  @ApiPropertyOptional({ 
    description: 'ID físico de la dirección vinculada', 
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' 
  })
  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  @Index()
  addressId: string;

  @ApiProperty({ 
    type: () => Address, 
    description: 'Datos de localización geográfica del activo' 
  })
  @OneToOne(() => Address, { 
    cascade: true, 
    eager: true, // Garantiza disponibilidad inmediata para filtros del frontend
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  /* --- 2. VALORES NUMÉRICOS (Fixed 4-8b) --- */

  @ApiPropertyOptional({ description: 'Canon de arrendamiento mensual', example: 1250.00 })
  @Column({ name: 'rent_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentPrice?: number;

  @ApiPropertyOptional({ description: 'Superficie útil total', example: 95.5 })
  @Column({ name: 'surface_m2', type: 'decimal', precision: 8, scale: 2, nullable: true })
  surfaceM2?: number;

  @ApiPropertyOptional({ description: 'Coordenada de latitud', example: 40.4167 })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Coordenada de longitud', example: -3.7037 })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Número de estancias principales', example: 3 })
  @Column({ type: 'int', nullable: true })
  rooms?: number;

  @ApiPropertyOptional({ description: 'Número de baños/aseos', example: 2 })
  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  /* --- 3. ESTADOS Y TIPOLOGÍAS (Enums / Small) --- */

  @ApiProperty({ 
    enum: PropertyType, 
    description: 'Clasificación funcional del inmueble', 
    default: PropertyType.RESIDENTIAL 
  })
  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.RESIDENTIAL })
  type: PropertyType;

  @ApiProperty({ 
    enum: PropertyStatus, 
    description: 'Estado operativo actual del activo', 
    default: PropertyStatus.AVAILABLE 
  })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  /* --- 4. CAMPOS TEXTUALES (Varchars / Text - Al final) --- */

  @ApiProperty({ 
    description: 'Código de referencia interno organizacional', 
    example: 'REF-2024-001' 
  })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiProperty({ 
    description: 'Denominación pública del inmueble', 
    example: 'Ático Centro Histórico' 
  })
  @Column({ length: 100 })
  name: string;

  @ApiPropertyOptional({ 
    description: 'Identificador oficial en el Catastro', 
    example: '9876543VK4797S0001AY' 
  })
  @Column({ name: 'cadastral_reference', length: 20, nullable: true })
  cadastralReference?: string;

  @ApiPropertyOptional({ description: 'Información de planta o altura', example: 'Planta 4, B' })
  @Column({ length: 20, nullable: true })
  floor?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales o memoria descriptiva' })
  @Column({ type: 'text', nullable: true })
  description?: string;
}