import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tax } from '../../tax/entities/tax.entity';

/**
 * @class BillingConcept
 * @description Catálogo maestro de conceptos facturables (Renta, Suministros, Fianzas).
 * Define el comportamiento por defecto de cada línea de factura para automatizar el cálculo fiscal.
 */
@Entity('billing_concepts')
export class BillingConcept {

  @ApiProperty({ description: 'Identificador único del concepto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Código interno (único)', example: 'RENTA_LOCAL' })
  @Column({ unique: true })
  name!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Etiqueta descriptiva para el usuario', example: 'Arrendamiento mensual local comercial' })
  @Column()
  label!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Precio base sugerido', example: 1000.00 })
  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } 
  })
  defaultPrice!: number; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Permite modificar el precio al facturar' })
  @Column({ default: true })
  isPriceEditable!: boolean; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Exige indicar mes y año (ej: para Rentas)' })
  @Column({ default: false })
  requiresPeriod!: boolean; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Evita duplicar este concepto en el mismo periodo' })
  @Column({ default: false })
  isUniquePerPeriod!: boolean; // 🚩 Rigor Rentix: !

  @ApiProperty({ description: 'Tipo: P (Producto) / S (Servicio)', enum: ['P', 'S'] })
  @Column({ type: 'varchar', length: 1, default: 'S' })
  itemType!: string; // 🚩 Rigor Rentix: !

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ CONFIGURACIÓN FISCAL POR DEFECTO
   * ───────────────────────────────────────────────────────────────── */

  @ApiProperty({ type: () => Tax, description: 'Impuesto (IVA) asociado por defecto' })
  @ManyToOne(() => Tax, { eager: true, nullable: false })
  @JoinColumn({ name: 'default_tax_id' })
  defaultTax!: Tax; // 🚩 Rigor Rentix: !

  @ApiPropertyOptional({ type: () => Tax, description: 'Retención (IRPF) asociada por defecto' })
  @ManyToOne(() => Tax, { eager: true, nullable: true })
  @JoinColumn({ name: 'default_retention_id' })
  defaultRetention?: Tax; // 🚩 Rigor Rentix: ? porque puede no llevar retención

  /* ─────────────────────────────────────────────────────────────────
   * 🕒 AUDITORÍA Y TRAZABILIDAD
   * ───────────────────────────────────────────────────────────────── */

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Fecha de borrado lógico' })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date; // 🚩 Rigor Rentix: ?
}