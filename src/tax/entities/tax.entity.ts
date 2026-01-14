import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TaxType } from '../enums/tax-type.enum';

@Entity('taxes')
export class Tax extends BaseEntity {

  @ApiProperty({ description: 'ID de la empresa' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ example: 'IVA General 21%' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ 
    enum: TaxType, 
    enumName: 'TaxType' 
  })
  @Column({ type: 'enum', enum: TaxType, default: TaxType.VAT })
  type: TaxType;

  @ApiProperty({ example: 21.00 })
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

  @ApiProperty({ default: false })
  @Column({ name: 'is_retention', default: false })
  isRetention: boolean;

  @ApiProperty({ default: '01' })
  @Column({ name: 'facturae_code', length: 10, nullable: true, default: '01' })
  facturaeCode: string;

}