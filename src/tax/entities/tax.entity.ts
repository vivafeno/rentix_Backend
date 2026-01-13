import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity'; // Asegúrate que esta ruta es correcta
import { Company } from '../../company/entities/company.entity';
import { TaxType } from '../enums/tax-type.enum';

@Entity('taxes')
export class Tax extends BaseEntity {
  // --------------------------------------------------------------------------
  // RELACIÓN DE SEGURIDAD (TENANT ISOLATION)
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'ID de la empresa a la que pertenece este tipo de impuesto' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // --------------------------------------------------------------------------
  // DATOS DEL IMPUESTO
  // --------------------------------------------------------------------------
  @ApiProperty({ example: 'IVA General 21%', description: 'Nombre interno para identificar el impuesto' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ 
    example: TaxType.VAT, 
    enum: TaxType, 
    description: 'Tipo lógico para cálculos (VAT suma, RETENTION resta)' 
  })
  @Column({ type: 'enum', enum: TaxType, default: TaxType.VAT })
  type: TaxType;

  @ApiProperty({ example: 21.00, description: 'Porcentaje matemático del impuesto' })
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

  // --------------------------------------------------------------------------
  // CONFIGURACIÓN AVANZADA
  // --------------------------------------------------------------------------
  @ApiProperty({ 
    example: true, 
    description: 'Calculado automáticamente: Si es RETENTION, este valor será true.' 
  })
  @Column({ name: 'is_retention', default: false })
  isRetention: boolean;

  @ApiProperty({ 
    example: '01', 
    description: 'Código oficial para Facturae (01=IVA, 02=IPSI, 04=IRPF, etc.)',
    required: false 
  })
  @Column({ name: 'facturae_code', length: 10, nullable: true, default: '01' })
  facturaeCode: string;

  @ApiProperty({ example: 'IVA_21', description: 'Código corto interno (slug)', required: false })
  @Column({ nullable: true })
  code: string;

}