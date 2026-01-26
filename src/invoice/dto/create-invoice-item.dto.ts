import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Invoice } from '../entities/invoice.entity';
import { ColumnNumericTransformer } from '../../common/transformers/column-numeric.transformer';

/**
 * @class InvoiceItem
 * @description Representa cada una de las líneas de detalle de una factura.
 * RIGOR RENTIX: Implementa precisión decimal estricta y limpieza en cascada.
 */
@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'ID de la factura a la que pertenece esta línea' })
  invoiceId!: string;

  /**
   * 🚩 RIGOR RENTIX - PUNTO 2 (CASCADA):
   * onDelete: 'CASCADE' asegura que si se elimina un borrador, sus líneas desaparecen.
   * orphanedRowAction: 'delete' garantiza que al actualizar la factura, las líneas eliminadas del array se borren físicamente.
   */
  @ManyToOne(() => Invoice, (invoice) => invoice.items, { 
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete' 
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice;

  /* ─────────────────────────────────────────────────────────────────
   * 📝 IDENTIFICACIÓN DEL CONCEPTO
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({ 
    description: 'Referencia técnica o abreviatura del cargo', 
    example: 'RENT',
    enum: ['RENT', 'IBI', 'TRUA', 'SUPPLY', 'ADJUST', 'PENALTY'] 
  })
  category!: string;

  @Column({ type: 'text' })
  @ApiProperty({ 
    description: 'Descripción detallada que aparecerá en el PDF',
    example: 'Alquiler mensual Enero 2026 - Local C/ Mayor 1' 
  })
  description!: string;

  /* ─────────────────────────────────────────────────────────────────
   * 📅 CONTROL DE PLAZOS Y PERIODOS
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Mes del periodo facturado (1-12)', example: 1 })
  periodMonth?: number;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Año del periodo o ejercicio del cargo', example: 2026 })
  periodYear?: number;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ description: 'Número de cuota o plazo actual', example: 1 })
  currentInstallment!: number;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ description: 'Total de cuotas o plazos previstos', example: 1 })
  totalInstallments!: number;

  /* ─────────────────────────────────────────────────────────────────
   * 💰 CÁLCULOS ECONÓMICOS (PUNTO 3 - RIGOR DECIMAL)
   * Usamos ColumnNumericTransformer para evitar que TypeORM devuelva strings.
   * ───────────────────────────────────────────────────────────────── */

  @Column({ 
    type: 'decimal', precision: 12, scale: 2, 
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Precio unitario bruto', example: 1000.00 })
  unitPrice!: number;

  @Column({ 
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Porcentaje de descuento', example: 5.00 })
  discountPercentage!: number;

  @Column({ 
    type: 'decimal', precision: 12, scale: 2,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Base imponible neta tras descuento', example: 950.00 })
  taxableAmount!: number;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ IMPUESTOS (IVA / RETENCIÓN)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Indica si aplica IVA' })
  applyTax!: boolean;

  @Column({ 
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Porcentaje de IVA', example: 21.00 })
  taxPercentage!: number;

  @Column({ 
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Cuota de IVA', example: 199.50 })
  taxAmount!: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Indica si aplica Retención IRPF' })
  applyRetention!: boolean;

  @Column({ 
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Porcentaje de retención', example: 19.00 })
  retentionPercentage!: number;

  @Column({ 
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Cuota de retención', example: 180.50 })
  retentionAmount!: number;

  @Column({ 
    type: 'decimal', precision: 12, scale: 2,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Total final (Base + IVA - Ret)', example: 969.00 })
  totalLine!: number;
}