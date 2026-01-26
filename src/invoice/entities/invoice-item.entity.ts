import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Invoice } from './invoice.entity';
import { ColumnNumericTransformer } from '../../common/transformers/column-numeric.transformer';

/**
 * @entity InvoiceItem
 * @description Representa el desglose detallado (líneas) de una factura.
 * RIGOR RENTIX 2026: Implementa precisión decimal estricta mediante Transformers
 * y asegura la integridad referencial mediante eliminaciones en cascada.
 */
@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🔗 VÍNCULO CON CABECERA
   * ───────────────────────────────────────────────────────────────── */

  /**
   * @column invoice_id
   * @description FK unificada. El nombre físico debe ser snake_case para Postgres.
   */
  @Column({ name: 'invoice_id', type: 'uuid' })
  @ApiProperty({ description: 'ID de la factura a la que pertenece esta línea' })
  invoiceId!: string;

  /**
   * @relation ManyToOne
   * @description Relación inversa con Invoice. 
   * onDelete: 'CASCADE' permite limpiar huérfanos al borrar borradores.
   */
  @ManyToOne(() => Invoice, (invoice) => invoice.items, { 
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete' 
  })
  @JoinColumn({ name: 'invoice_id' }) // 🚩 Vinculado exactamente a la columna física
  invoice!: Invoice;

  /* ─────────────────────────────────────────────────────────────────
   * 📝 IDENTIFICACIÓN DEL CONCEPTO
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({ 
    description: 'Categoría técnica del cargo', 
    example: 'RENT',
    enum: ['RENT', 'IBI', 'TRUA', 'SUPPLY', 'ADJUST', 'PENALTY'] 
  })
  category!: string;

  @Column({ type: 'text' })
  @ApiProperty({ 
    description: 'Literal que se imprimirá en el PDF de la factura',
    example: 'Alquiler mensual Enero 2026 - Ref: 102' 
  })
  description!: string;

  /* ─────────────────────────────────────────────────────────────────
   * 📅 CONTROL DE PERIODOS
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'period_month', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Mes facturado (1-12)', example: 1 })
  periodMonth?: number;

  @Column({ name: 'period_year', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Año facturado', example: 2026 })
  periodYear?: number;

  @Column({ name: 'current_installment', type: 'int', default: 1 })
  @ApiProperty({ description: 'Número de plazo actual', example: 1 })
  currentInstallment!: number;

  @Column({ name: 'total_installments', type: 'int', default: 1 })
  @ApiProperty({ description: 'Total de plazos previstos', example: 1 })
  totalInstallments!: number;

  /* ─────────────────────────────────────────────────────────────────
   * 💰 CÁLCULOS ECONÓMICOS (TRANSFORMER PARA PRECISIÓN)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ 
    name: 'unit_price',
    type: 'decimal', precision: 12, scale: 2, 
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Precio unitario bruto', example: 1000.00 })
  unitPrice!: number;

  @Column({ 
    name: 'discount_percentage',
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Porcentaje de descuento aplicado', example: 0.00 })
  discountPercentage!: number;

  @Column({ 
    name: 'taxable_amount',
    type: 'decimal', precision: 12, scale: 2,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Base imponible neta tras descuentos', example: 1000.00 })
  taxableAmount!: number;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ RÉGIMEN FISCAL (IVA / RETENCIONES)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'apply_tax', type: 'boolean', default: true })
  @ApiProperty({ description: '¿Sujeto a IVA?' })
  applyTax!: boolean;

  @Column({ 
    name: 'tax_percentage',
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Tipo de IVA (%)', example: 21.00 })
  taxPercentage!: number;

  @Column({ 
    name: 'tax_amount',
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Cuota de IVA resultante', example: 210.00 })
  taxAmount!: number;

  @Column({ name: 'apply_retention', type: 'boolean', default: false })
  @ApiProperty({ description: '¿Sujeto a Retención IRPF?' })
  applyRetention!: boolean;

  @Column({ 
    name: 'retention_percentage',
    type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Tipo de retención (%)', example: 19.00 })
  retentionPercentage!: number;

  @Column({ 
    name: 'retention_amount',
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Cuota de retención resultante', example: 190.00 })
  retentionAmount!: number;

  @Column({ 
    name: 'total_line',
    type: 'decimal', precision: 12, scale: 2,
    transformer: new ColumnNumericTransformer() 
  })
  @ApiProperty({ description: 'Total de la línea (Base + IVA - IRPF)', example: 1020.00 })
  totalLine!: number;
}