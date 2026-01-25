import { 
  Entity, 
  Column, 
  OneToMany, 
  OneToOne, 
  ManyToOne, 
  JoinColumn, 
  BeforeUpdate,
  BeforeInsert 
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';
import { Property } from 'src/property/entities/property.entity';
import { PersonType } from 'src/fiscal/enums/personType.enum';

/**
 * @description Entidad Núcleo de Patrimonio (Tenant).
 * Gestiona la segregación de datos y el estado operativo para monetización.
 * @version 2026.2.1
 */
@Entity('companies')
export class Company extends BaseEntity {

  /* --- IDENTIDAD FISCAL --- */

  @ApiProperty({ description: 'ID de referencia fiscal', format: 'uuid' })
  @Column({ name: 'fiscal_entity_id', type: 'uuid' })
  fiscalEntityId: string;

  @ApiProperty({ type: () => FiscalEntity })
  @OneToOne(() => FiscalEntity, (fiscal) => fiscal.company, {
    eager: true,
    cascade: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fiscal_entity_id' })
  fiscalEntity: FiscalEntity;

  /* --- DIRECCIÓN FISCAL (Obligatoria para Veri*factu) --- */

  @ApiProperty({ description: 'ID de la dirección fiscal', format: 'uuid' })
  @Column({ name: 'fiscal_address_id', type: 'uuid' })
  fiscalAddressId: string;

  @ApiProperty({ type: () => Address })
  @OneToOne(() => Address, {
    eager: true,
    cascade: true,
    nullable: false, 
  })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress: Address;

  /* --- PERSONALIDAD JURÍDICA (AEAT: F/J) --- */

  @ApiProperty({ 
    enum: PersonType, 
    enumName: 'PersonType', 
    description: 'Naturaleza jurídica: F (Física) o J (Jurídica)' 
  })
  @Column({
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY // Se asume Jurídica por defecto para Rentix
  })
  personType: PersonType;

  /* --- AUDITORÍA Y MONETIZACIÓN --- */

  @ApiProperty({ description: 'ID del Owner (Inmutable tras creación)' })
  @Column({ name: 'created_by_user_id', type: 'uuid', update: false })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  /* --- LÓGICA AUTOMÁTICA DE ESTADO --- */

  @BeforeUpdate()
  @BeforeInsert()
  syncStatusAudit() {
    if (this.isActive === false) {
      this.deletedAt = this.deletedAt || new Date();
    } else {
      this.deletedAt = null;
    }
  }

  /* --- RELACIONES --- */

  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.company)
  companyRoles: CompanyRoleEntity[];

  @OneToMany(() => Property, (property) => property.company)
  properties: Property[];
}