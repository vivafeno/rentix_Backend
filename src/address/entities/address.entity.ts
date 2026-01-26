import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Property } from '../../property/entities/property.entity';
import { TenantProfile } from '../../tenant-profile/entities/tenant-profile.entity';
import { AddressStatus } from '../enums/address-status.enum';

/**
 * @class Address
 * @description Entidad de localización geográfica y fiscal.
 * Proporciona el soporte de ubicación para activos (Property) y sujetos (Tenant).
 * Rigor 2026: Normalización de códigos postales y estados de validación.
 */
@Entity('addresses')
export class Address extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 📍 COMPONENTES DE DIRECCIÓN
   * ───────────────────────────────────────────────────────────────── */

  @ApiProperty({ description: 'Vía, número, bloque y puerta', example: 'Calle Mayor 15, 2B' })
  @Column({ length: 255 })
  street!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Código postal', example: '28001' })
  @Column({ name: 'postal_code', length: 20 })
  postalCode!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Localidad o Ciudad', example: 'Madrid' })
  @Column({ length: 100 })
  city!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'País de la dirección', default: 'España' })
  @Column({ length: 100, default: 'España' })
  country!: string; // 🚩 Rigor Rentix: !

  /* ─────────────────────────────────────────────────────────────────
   * ⚙️ ESTADO Y CONFIGURACIÓN
   * ───────────────────────────────────────────────────────────────── */

  @ApiProperty({ enum: AddressStatus, description: 'Estado de verificación de la dirección' })
  @Column({
    type: 'enum',
    enum: AddressStatus,
    default: AddressStatus.DRAFT,
  })
  status!: AddressStatus; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Define si es la dirección principal del registro vinculado' })
  @Column({ name: 'is_main', type: 'boolean', default: false })
  isMain!: boolean; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Define si es la dirección de facturación por defecto' })
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean; // 🚩 Rigor Rentix: !

  /* ─────────────────────────────────────────────────────────────────
   * 🛡️ AUDITORÍA DE CONTEXTO
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  /* ─────────────────────────────────────────────────────────────────
   * 🔗 RELACIONES POLIMÓRFICAS (OPCIONALES)
   * ───────────────────────────────────────────────────────────────── */

  /**
   * @relation ManyToOne
   * @description Propiedad inmobiliaria asociada a esta dirección física.
   */
  @ApiPropertyOptional({ type: () => Property })
  @ManyToOne(() => Property, (property) => property.address, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Property;

  @ApiPropertyOptional({ description: 'ID de la propiedad vinculada' })
  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId?: string;

  /**
   * @relation ManyToOne
   * @description Inquilino/Cliente asociado a esta dirección fiscal o de envío.
   */
  @ApiPropertyOptional({ type: () => TenantProfile })
  @ManyToOne(() => TenantProfile, (profile) => profile.addresses, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantProfile;

  @ApiPropertyOptional({ description: 'ID del inquilino vinculado' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;
}