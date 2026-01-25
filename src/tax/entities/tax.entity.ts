import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TaxType } from '../enums/tax-type.enum';

/**
 * @class Tax
 * @description Configuración fiscal blindada para el motor de facturación.
 * Cumple con los requisitos de Veri*factu (AEAT) para el desglose de IVA/IRPF.
 * @version 2026.2.0
 */
@Entity('taxes')
export class Tax extends BaseEntity {
  /* --- CONTEXTO PATRIMONIAL --- */

  @ApiProperty({ description: 'UUID de la empresa emisora' })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* --- DEFINICIÓN FISCAL (Veri*factu) --- */

  @ApiProperty({
    example: 'IVA Exento - Alquiler Vivienda',
    description: 'Nombre descriptivo',
  })
  @Column({ name: 'nombre', length: 100 })
  nombre: string;

  @ApiProperty({
    enum: TaxType,
    description: 'Categoría impositiva (IVA, IRPF, IGIC, IPSI)',
  })
  @Column({ type: 'enum', enum: TaxType, default: TaxType.IVA })
  tipo: TaxType;

  @ApiProperty({ example: 21.0, description: 'Tipo impositivo aplicado' })
  @Column({
    name: 'porcentaje',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  porcentaje: number;

  @ApiProperty({
    description: 'Si es true, minora el total de la factura (Retención)',
  })
  @Column({ name: 'es_retencion', type: 'boolean', default: false })
  esRetencion: boolean;

  /* --- ATRIBUTOS CRÍTICOS VERI*FACTU --- */

  /**
   * @description Causa de Exención (Art. 20 LIVA).
   * Obligatorio para facturas al 0% (ej. E1 para alquiler de viviendas).
   * Veri*factu lo exige para el nodo <CausaExencion>.
   */
  @ApiProperty({
    example: 'E1',
    description: 'Código AEAT: E1 (Vivienda), E2 (Enseñanza), etc.',
  })
  @Column({ name: 'causa_exencion', length: 5, nullable: true })
  causaExencion?: string;

  /**
   * @description Tipo de impuesto para el esquema FacturaE y SII.
   * '01' = IVA, '02' = IRPF, '03' = IGIC.
   */
  @ApiProperty({ example: '01', description: 'Código oficial para FacturaE' })
  @Column({ name: 'codigo_facturae', length: 10, default: '01' })
  codigoFacturae: string;

  /**
   * @description Indica si este impuesto es el configurado por defecto para la empresa.
   */
  @Column({ name: 'es_predeterminado', default: false })
  esPredeterminado: boolean;
}
