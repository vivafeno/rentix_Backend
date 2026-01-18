import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TaxType } from '../enums/tax-type.enum';

/**
 * Entidad que representa la configuración fiscal de un impuesto (IVA, Retención, IGIC).
 * * Estándares Blueprint 2026:
 * - Herencia limpia de BaseEntity con soporte nativo para Soft-Delete.
 * - Aislamiento multi-tenant mediante companyId indexado.
 * - Transformación de datos decimales para precisión financiera.
 * * @version 1.0.2
 * @author Rentix
 */
@Entity('taxes')
export class Tax extends BaseEntity {

  /**
   * Identificador de la empresa propietaria.
   */
  @ApiProperty({ 
    description: 'UUID de la empresa propietaria',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  /**
   * Relación con la organización dueña del registro.
   */
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /**
   * Etiqueta comercial del impuesto.
   */
  @ApiProperty({ 
    example: 'IVA General 21%',
    description: 'Nombre descriptivo para listados y facturas' 
  })
  @Column({ length: 50 })
  name: string;

  /**
   * Clasificación impositiva según normativa.
   */
  @ApiProperty({ 
    enum: TaxType, 
    enumName: 'TaxType',
    description: 'Categorización según normativa fiscal vigente'
  })
  @Column({ 
    type: 'enum', 
    enum: TaxType, 
    default: TaxType.VAT 
  })
  type: TaxType;

  /**
   * Tipo impositivo porcentual.
   * Transformer garantiza la conversión de Decimal (String DB) a Number (TS).
   */
  @ApiProperty({ 
    example: 21.00, 
    description: 'Porcentaje impositivo (0-100)' 
  })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  rate: number;

  /**
   * Flag indicador de retención (minora la base imponible).
   */
  @ApiProperty({ 
    default: false, 
    description: 'Define si el impuesto resta de la base (ej. IRPF)' 
  })
  @Column({ name: 'is_retention', type: 'boolean', default: false })
  isRetention: boolean;

  /**
   * Identificador para el esquema FacturaE.
   */
  @ApiProperty({ 
    default: '01', 
    description: 'Código oficial para exportación FacturaE' 
  })
  @Column({ name: 'facturae_code', length: 10, nullable: true, default: '01' })
  facturaeCode: string;
}