import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Invoice } from './invoice.entity';
import { Tax } from '../../tax/entities/tax.entity';

/**
 * @description Representa cada una de las líneas de detalle de una factura.
 * Implementa lógica de cálculo granular: Base Bruta -> Descuento -> Base Neta -> Impuestos.
 */
@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'ID de la factura a la que pertenece esta línea' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  /* ─────────────────────────────────────────────────────────────────
   * 📝 IDENTIFICACIÓN DEL CONCEPTO
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({ 
    description: 'Referencia técnica o abreviatura del cargo', 
    example: 'RENT',
    enum: ['RENT', 'IBI', 'TRUA', 'SUPPLY', 'ADJUST', 'PENALTY'] 
  })
  category: string;

  @Column({ type: 'text' })
  @ApiProperty({ 
    description: 'Descripción detallada que aparecerá en el PDF',
    example: 'Alquiler mensual Enero 2026 - Local C/ Mayor 1' 
  })
  description: string;

  /* ─────────────────────────────────────────────────────────────────
   * 📅 CONTROL DE PLAZOS Y PERIODOS (LÓGICA RENTIX)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Mes del periodo facturado (1-12)', example: 1 })
  periodMonth: number;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional({ description: 'Año del periodo o ejercicio del cargo', example: 2026 })
  periodYear: number;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ description: 'Número de cuota o plazo actual', example: 1 })
  currentInstallment: number;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ description: 'Total de cuotas o plazos previstos', example: 3 })
  totalInstallments: number;

  /* ─────────────────────────────────────────────────────────────────
   * 💰 CÁLCULOS ECONÓMICOS (DECIMAL PRECISION)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Precio unitario o base bruta antes de descuentos', example: 1000.00 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Porcentaje de descuento aplicado a la línea', example: 5.00 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Base imponible neta tras aplicar descuento', example: 950.00 })
  taxableAmount: number;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ IMPUESTOS (IVA / RETENCIÓN)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Indica si aplica IVA a esta línea' })
  applyTax: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Porcentaje de IVA aplicado', example: 21.00 })
  taxPercentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Cuota de IVA resultante', example: 199.50 })
  taxAmount: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Indica si aplica Retención IRPF a esta línea' })
  applyRetention: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Porcentaje de retención aplicado', example: 19.00 })
  retentionPercentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Cuota de retención resultante', example: 180.50 })
  retentionAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Total final de la línea (Base Neta + IVA - Ret)', example: 969.00 })
  totalLine: number;
}