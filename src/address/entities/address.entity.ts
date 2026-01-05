import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { AddressType } from '../enums/addres-type.enum';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

@Entity('addresses')
@Index(['companyId'])
@Index(['clientProfileId'])
export class Address extends BaseEntity {

  /* ------------------------------------------------------------------
   * MULTIEMPRESA
   * Toda dirección pertenece SIEMPRE a una empresa
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Empresa propietaria de la dirección',
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
   * (ej. direcciones genéricas de empresa)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Cliente asociado a la dirección (opcional)',
    format: 'uuid',
    required: false,
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

  @ApiProperty({ example: 'Calle Mayor 12' })
  @Column({ name: 'address_line1' })
  addressLine1: string;

  @ApiProperty({
    example: '3º izquierda',
    required: false,
  })
  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @ApiProperty({ example: '28001' })
  @Column({ name: 'postal_code' })
  postalCode: string;

  @ApiProperty({ example: 'Madrid' })
  @Column()
  city: string;

  @ApiProperty({ example: 'Madrid' })
  @Column()
  province: string;

  @ApiProperty({
    example: 'ES',
    description: 'Código de país ISO-3166-1 alpha-2',
  })
  @Column({ name: 'country_code', length: 2, default: 'ES' })
  countryCode: string;

  /* ------------------------------------------------------------------
   * CONTROL DE DIRECCIÓN PRINCIPAL
   * Reglas:
   * - Solo una por cliente y tipo (validado en service)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    example: true,
    description: 'Indica si es la dirección principal para su tipo',
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
