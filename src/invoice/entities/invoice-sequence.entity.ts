import { Entity, Column, Unique, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

/**
 * @description Entidad encargada de gestionar los contadores de facturación por empresa.
 * Hereda de BaseEntity para mantener el estándar de auditoría y Soft Delete de Rentix 2026.
 * Garantiza la correlatividad exigida por Veri*factu 2026.
 */
@Entity('invoice_sequences')
@Unique(['companyId', 'year', 'prefix']) // Rigor: Evita saltos y duplicidad en la numeración legal
export class InvoiceSequence extends BaseEntity {
  
  @Index()
  @Column({ type: 'uuid' })
  @ApiProperty({ 
    description: 'ID de la empresa propietaria del contador (Aislamiento Multi-tenant)',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  companyId: string;

  @Column({ type: 'int' })
  @ApiProperty({ 
    description: 'Año fiscal de la serie',
    example: 2026 
  })
  year: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: '',
    comment: 'Prefijo de serie. Ej: "" (Ordinaria), "R" (Rectificativa)' 
  })
  @ApiProperty({ 
    description: 'Prefijo identificador de la serie',
    example: 'R' 
  })
  prefix: string;

  @Column({ 
    type: 'int', 
    default: 0,
    comment: 'Último número de factura asignado' 
  })
  @ApiProperty({ 
    description: 'Valor actual del contador secuencial',
    example: 155 
  })
  lastNumber: number;
}