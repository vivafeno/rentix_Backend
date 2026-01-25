import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { ContactType } from '../enums/contact-type.enum';
import { Company } from '../../company/entities/company.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

/**
 * @class Contact
 * @description Representa un punto de contacto humano asociado a una entidad legal (Empresa o Inquilino).
 * Utilizado para agenda, notificaciones y gestión de incidencias.
 * @extends BaseEntity
 */
@Entity('contacts')
export class Contact extends BaseEntity {

  // --- DATOS PRINCIPALES ---

  @ApiProperty({
    description: 'Nombre completo y apellidos del contacto',
    example: 'Ana López Martínez',
    minLength: 3,
    maxLength: 150,
  })
  @Column({ name: 'full_name', length: 150, nullable: false })
  fullName: string;

  @ApiProperty({
    description: 'Categoría funcional del contacto dentro de la organización',
    enum: ContactType,
    example: ContactType.MAINTENANCE,
    default: ContactType.OTHER,
  })
  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.OTHER,
    name: 'type',
  })
  type: ContactType;

  // --- DATOS DE CONTACTO ---

  @ApiPropertyOptional({
    description: 'Correo electrónico corporativo o personal',
    example: 'ana.lopez@servicios.com',
    format: 'email',
  })
  @Column({ length: 150, nullable: true })
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto principal (Móvil o Fijo)',
    example: '+34 600 123 456',
  })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición laboral (ej. Gerente, Fontanero Jefe)',
    example: 'Directora Técnica',
  })
  @Column({ length: 100, nullable: true })
  position: string;

  @ApiPropertyOptional({
    description: 'Dirección física específica si difiere de la sede principal',
    example: 'Av. Diagonal 123, Planta 2',
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiPropertyOptional({
    description: 'Notas internas o instrucciones de contacto (ej. Horarios)',
    example: 'Llamar solo en horario de mañanas de 8:00 a 14:00',
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  // --- RELACIONES CONTEXTUALES ---

  /**
   * @property company
   * @description Empresa a la que pertenece este contacto (Si aplica).
   * Relación: Many-to-One.
   */
  @ApiPropertyOptional({ type: () => Company })
  @ManyToOne(() => Company, (company) => company.contacts, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiPropertyOptional({ description: 'ID de la empresa vinculada' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  /**
   * @property tenant
   * @description Inquilino al que pertenece este contacto (Si aplica).
   * Relación: Many-to-One.
   */
  @ApiPropertyOptional({ type: () => Tenant })
  @ManyToOne(() => Tenant, (tenant) => tenant.contacts, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiPropertyOptional({ description: 'ID del inquilino vinculado' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string;
}