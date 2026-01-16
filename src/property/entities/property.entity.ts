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
@Index(['addressId'])
export class Property extends BaseEntity {

  /* --- 1. IDENTIFICADORES Y RELACIONES --- */

  @ApiProperty({ 
    description: 'ID de la empresa propietaria', 
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' 
  })
  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId: string;

  @ApiProperty({ type: () => Company, description: 'Relación con la entidad Empresa' })
  @ManyToOne(() => Company, (company) => company.properties, { 
    nullable: false, 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiPropertyOptional({ 
    description: 'ID físico de la dirección vinculada', 
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' 
  })
  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  addressId: string;

  @ApiProperty({ 
    type: () => Address, 
    description: 'Datos de localización geográfica del inmueble' 
  })
  @OneToOne(() => Address, { 
    cascade: true, 
    eager: true, 
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  /* --- 2. VALORES NUMÉRICOS (Alineación de 8 bytes) --- */

  @ApiPropertyOptional({ description: 'Precio de alquiler mensual', example: 1250.00 })
  @Column({ name: 'rent_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentPrice?: number;

  @ApiPropertyOptional({ description: 'Superficie útil en metros cuadrados', example: 95.5 })
  @Column({ name: 'surface_m2', type: 'decimal', precision: 8, scale: 2, nullable: true })
  surfaceM2?: number;

  @ApiPropertyOptional({ description: 'Coordenada de latitud', example: 40.416775 })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Coordenada de longitud', example: -3.703790 })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Número de habitaciones', example: 3 })
  @Column({ type: 'int', nullable: true })
  rooms?: number;

  @ApiPropertyOptional({ description: 'Número de baños', example: 2 })
  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  /* --- 3. ESTADOS Y CLASIFICACIÓN (Enums) --- */

  @ApiProperty({ 
    enum: PropertyType, 
    description: 'Categoría del inmueble', 
    default: PropertyType.RESIDENTIAL 
  })
  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.RESIDENTIAL })
  type: PropertyType;

  @ApiProperty({ 
    enum: PropertyStatus, 
    description: 'Estado operativo actual', 
    default: PropertyStatus.AVAILABLE 
  })
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  /* --- 4. CAMPOS DE TEXTO (Longitud variable) --- */

  @ApiProperty({ description: 'Código de referencia interno del gestor', example: 'REF-2024-001' })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiProperty({ description: 'Nombre descriptivo público', example: 'Ático Duplex con Vistas' })
  @Column({ length: 100 })
  name: string;

  @ApiPropertyOptional({ description: 'Referencia oficial del catastro', example: '9876543VK4797S0001AY' })
  @Column({ name: 'cadastral_reference', length: 20, nullable: true })
  cadastralReference?: string;

  @ApiPropertyOptional({ description: 'Información de planta/piso', example: 'Planta 4, Puerta B' })
  @Column({ length: 20, nullable: true })
  floor?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada o notas adicionales' })
  @Column({ type: 'text', nullable: true })
  description?: string;
}