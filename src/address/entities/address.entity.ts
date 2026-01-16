import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

@Entity('addresses')
@Index(['companyId'])
@Index(['clientProfileId'])
@Index(['status'])
@Index(['companyId', 'city']) // 👈 Optimiza el filtro de localidad
@Index(['companyId', 'isActive'])
@Index(['companyId', 'type'])
@Index(['createdByUserId']) 
export class Address extends BaseEntity {

  /* --- 1. IDENTIFICADORES Y RELACIONES (UUIDs / Fixed 16b) --- */

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.properties, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'client_profile_id', type: 'uuid', nullable: true })
  clientProfileId?: string;

  @ManyToOne(() => ClientProfile, (cp) => cp.addresses, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_profile_id' })
  clientProfile?: ClientProfile;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  /* --- 2. ESTADOS Y TIPOS (Enums / Fixed small) --- */

  @ApiProperty({ enum: AddressStatus })
  @Column({ type: 'enum', enum: AddressStatus, default: AddressStatus.DRAFT })
  status: AddressStatus;

  @ApiProperty({ enum: AddressType })
  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @ApiProperty({ default: false })
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  /* --- 3. DATOS POSTALES (Strings / Variable - Al final) --- */

  @ApiProperty({ example: 'Calle Mayor 12' })
  @Column({ name: 'address_line1' })
  addressLine1: string;

  @ApiPropertyOptional({ example: '3º izquierda' })
  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @ApiProperty({ example: '46250' })
  @Column({ name: 'postal_code' })
  postalCode: string;

  @ApiProperty({ example: 'Valencia' })
  @Column()
  city: string;

  @ApiPropertyOptional({ example: 'Valencia' })
  @Column({ nullable: true })
  province?: string;

  @ApiProperty({ example: 'ES', default: 'ES' })
  @Column({ name: 'country_code', length: 2, default: 'ES' })
  countryCode: string;

  /* --- 4. NORMALIZACIÓN DE DATOS --- */

  @BeforeInsert()
  @BeforeUpdate()
  normalizeData() {
    if (this.city) this.city = this.city.trim();
    if (this.province) this.province = this.province.trim();
    if (this.postalCode) this.postalCode = this.postalCode.trim();
    if (this.addressLine1) this.addressLine1 = this.addressLine1.trim();
  }
}