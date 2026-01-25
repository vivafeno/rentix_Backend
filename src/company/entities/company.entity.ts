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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';
import { Property } from 'src/property/entities/property.entity';
import { PersonType } from 'src/fiscal/enums/personType.enum';
import { Contact } from 'src/contact/entities/contact.entity';

/**
 * @class Company
 * @description Entidad Núcleo de Patrimonio (Contexto de Negocio).
 * Representa la unidad operativa y fiscal mínima para la segregación de datos,
 * gestión patrimonial y cumplimiento con Veri*factu.
 * @version 2026.2.2
 */
@Entity('companies')
export class Company extends BaseEntity {

  /* --- IDENTIDAD FISCAL (CORE) --- */

  @ApiProperty({ description: 'ID de referencia fiscal', format: 'uuid' })
  @Column({ name: 'fiscal_entity_id', type: 'uuid' })
  fiscalEntityId: string;

  @ApiProperty({ 
    type: () => FiscalEntity, 
    description: 'Datos fiscales completos vinculados a la empresa' 
  })
  @OneToOne(() => FiscalEntity, (fiscal) => fiscal.company, {
    eager: true,
    cascade: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fiscal_entity_id' })
  fiscalEntity: FiscalEntity;

  /* --- LOCALIZACIÓN OPERATIVA --- */

  @ApiProperty({ description: 'ID de la dirección fiscal obligatoria', format: 'uuid' })
  @Column({ name: 'fiscal_address_id', type: 'uuid' })
  fiscalAddressId: string;

  @ApiProperty({ 
    type: () => Address, 
    description: 'Dirección física y fiscal legalmente registrada' 
  })
  @OneToOne(() => Address, {
    eager: true,
    cascade: true,
    nullable: false, 
  })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress: Address;

  /* --- NATURALEZA JURÍDICA --- */

  @ApiProperty({ 
    enum: PersonType, 
    enumName: 'PersonType', 
    description: 'Clasificación AEAT: Persona Física (F) o Jurídica (J)' 
  })
  @Column({
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
    name: 'person_type'
  })
  personType: PersonType;

  /* --- TRAZABILIDAD Y PROPIEDAD --- */

  @ApiProperty({ description: 'Usuario que originó el alta de la empresa (Inmutable)' })
  @Column({ name: 'created_by_user_id', type: 'uuid', update: false })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  /* --- LÓGICA DE ESTADO (PROTOCOLOS RENTIX) --- */

  /**
   * Sincroniza automáticamente la fecha de borrado lógico basándose en el estado activo.
   * Rigor 2026: No dependemos de softDelete() nativo para control total del estado.
   */
  @BeforeUpdate()
  @BeforeInsert()
  syncStatusAudit() {
    if (this.isActive === false) {
      this.deletedAt = this.deletedAt || new Date();
    } else {
      this.deletedAt = null;
    }
  }

  /* --- RELACIONES ESTRUCTURALES --- */

  @ApiPropertyOptional({ 
    type: () => [CompanyRoleEntity], 
    description: 'Matriz de roles y permisos de usuarios en esta empresa' 
  })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.company)
  companyRoles: CompanyRoleEntity[];

  @ApiPropertyOptional({ 
    type: () => [Property], 
    description: 'Inventario de activos inmobiliarios gestionados por la empresa' 
  })
  @OneToMany(() => Property, (property) => property.company)
  properties: Property[];

  /**
   * Relación Inversa: Agenda de Contactos
   * @description Puntos de contacto humanos (gestores, técnicos, dirección) vinculados a esta empresa.
   */
  @ApiPropertyOptional({ 
    type: () => [Contact], 
    description: 'Directorio humano asociado para gestiones operativas y técnicas' 
  })
  @OneToMany(() => Contact, (contact) => contact.company)
  contacts: Contact[];
}