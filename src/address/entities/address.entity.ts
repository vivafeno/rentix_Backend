import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Property } from 'src/property/entities/property.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';
import { AddressStatus } from '../enums/address-status.enum';

@Entity('addresses')
export class Address extends BaseEntity {
  @Column({ length: 255 })
  street: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, default: 'España' })
  country: string;

  @Column({
    type: 'enum',
    enum: AddressStatus,
    default: AddressStatus.DRAFT,
  })
  status: AddressStatus;

  @Column({ name: 'is_main', type: 'boolean', default: false })
  isMain: boolean;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  /* --- RELACIONES --- */

  @ManyToOne(() => Property, (property) => property.address, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Property;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId?: string;

  @ManyToOne(() => TenantProfile, (profile) => profile.addresses, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantProfile;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;
}