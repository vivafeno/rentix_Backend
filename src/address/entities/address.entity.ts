import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { AddressType } from '../enums/addressType.enum';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * Entidad Address
 *
 * Soporta creación previa a Company mediante status = DRAFT.
 * Pensada para flujos multi-step (user → address → company).
 */
@Entity('addresses')
@Index(['companyId'])
@Index(['clientProfileId'])
@Index(['status'])
@Index(['companyId', 'isActive'])
@Index(['companyId', 'type'])
@Index(['createdByUserId']) // 👈 NUEVO: Para buscar rápido los drafts de un usuario
export class Address extends BaseEntity {

  /* ------------------------------------------------------------------
   * MULTIEMPRESA
   * Una dirección puede existir SIN empresa (status = DRAFT)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID de la empresa propietaria de la dirección. Null si es un borrador (Draft).',
    format: 'uuid',
  })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  /* ------------------------------------------------------------------
   * AUDITORÍA / PROPIEDAD DEL BORRADOR (NUEVO)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID del usuario que creó el registro. Vital para asegurar los DRAFTS huérfanos.',
    format: 'uuid',
  })
  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  /* ------------------------------------------------------------------
   * ESTADO DE LA DIRECCIÓN
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Estado de la dirección dentro del flujo de negocio',
    enum: AddressStatus,
    example: AddressStatus.DRAFT,
    default: AddressStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: AddressStatus,
    default: AddressStatus.DRAFT,
  })
  status: AddressStatus;

  /* ------------------------------------------------------------------
   * RELACIÓN CON CLIENTE
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID del cliente asociado a la dirección (si aplica)',
    format: 'uuid',
  })
  @Column({ name: 'client_profile_id', type: 'uuid', nullable: true })
  clientProfileId?: string;

  @ManyToOne(() => ClientProfile, (cp) => cp.addresses, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_profile_id' })
  clientProfile?: ClientProfile;

  /* ------------------------------------------------------------------
   * TIPO DE DIRECCIÓN
   * ------------------------------------------------------------------ */

  @ApiProperty({
    enum: AddressType,
    description: 'Tipo de dirección según su uso funcional',
    example: AddressType.FISCAL,
  })
  @Column({
    type: 'enum',
    enum: AddressType,
  })
  type: AddressType;

  /* ------------------------------------------------------------------
   * DATOS POSTALES
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Dirección principal (Calle, número, etc.)',
    example: 'Calle Mayor 12',
  })
  @Column({ name: 'address_line1' })
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Información adicional de la dirección (Piso, puerta, escalera)',
    example: '3º izquierda',
  })
  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '46250',
  })
  @Column({ name: 'postal_code' })
  postalCode: string;

  @ApiProperty({
    description: 'Ciudad / municipio',
    example: 'Valencia',
  })
  @Column()
  city: string;

  @ApiPropertyOptional({
    description: 'Provincia o Estado',
    example: 'Valencia',
  })
  @Column({ nullable: true })
  province?: string;

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
    default: 'ES',
  })
  @Column({ name: 'country_code', length: 2, default: 'ES' })
  countryCode: string;

  /* ------------------------------------------------------------------
   * CONTROL DE DIRECCIÓN PRINCIPAL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Indica si es la dirección principal para su tipo dentro de la empresa',
    example: false,
    default: false,
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}