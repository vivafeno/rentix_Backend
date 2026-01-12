import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('taxes')
export class Tax {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID único UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'IVA 21%', description: 'Nombre descriptivo del impuesto' })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({ example: 21.00, description: 'Porcentaje del impuesto' })
  @Column({ type: 'decimal', precision: 5, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  }})
  rate: number;

  @ApiProperty({ example: '01', enum: ['01', '02', '03', '04', '05'], description: 'Código oficial Facturae (01=IVA, 04=IRPF)' })
  @Column({ type: 'varchar', length: 2, default: '01' })
  taxType: string;

  @ApiProperty({ example: false, description: 'Si es true, el valor resta del total (Retención)' })
  @Column({ default: false })
  isRetention: boolean;

  @ApiProperty({ example: 'Exento por Art. 20', required: false, description: 'Código o motivo de exención legal' })
  @Column({ nullable: true })
  facturaeCode: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}