import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { AddressType } from '../enums/addressType.enum';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

/**
 * Entidad Address
 * Puede ser utilizada como response DTO en OpenAPI.
 * Todos los campos están explícitamente documentados para Swagger.
 */
@Entity('addresses')
@Index(['companyId'])
@Index(['clientProfileId'])
export class Address extends BaseEntity {

  /* ------------------------------------------------------------------
   * MULTIEMPRESA
   * Toda dirección pertenece SIEMPRE a una empresa
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'ID de la empresa propietaria de la dirección',
    format: 'uuid',
  })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* ------------------------------------------------------------------
   * RELACIÓN CON CLIENTE
   * Opcional: una dirección puede no pertenecer a un cliente concreto
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'ID del cliente asociado a la dirección',
    format: 'uuid',
    required: false,
    nullable: true,
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
   * FISCAL | COMMERCIAL | PROPERTY | OTHER
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
    description: 'Dirección principal',
    example: 'Calle Mayor 12',
  })
  @Column({ name: 'address_line1' })
  addressLine1: string;

  @ApiProperty({
    description: 'Información adicional de la dirección',
    example: '3º izquierda',
    required: false,
    nullable: true,
  })
  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '28001',
  })
  @Column({ name: 'postal_code' })
  postalCode: string;

  @ApiProperty({
    description: 'Ciudad / municipio',
    example: 'Madrid',
  })
  @Column()
  city: string;

  @ApiProperty({
    description: 'Provincia',
    example: 'Madrid',
  })
  @Column()
  province: string;

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
    description: 'Indica si es la dirección principal para su tipo',
    example: true,
    default: false,
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
