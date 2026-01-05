import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class FiscalRateEntity {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tipo fiscal (ej: IVA_GENERAL, IRPF)',
    example: 'IVA_GENERAL',
  })
  @Column()
  tipo: string;

  @ApiProperty({
    description: 'Descripción legible',
    example: 'IVA general',
  })
  @Column()
  descripcion: string;

  @ApiProperty({
    description: 'Porcentaje aplicado',
    example: 21,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @ApiProperty({
    description: 'País (ISO-3166-1 alpha-2)',
    example: 'ES',
  })
  @Column({ name: 'country_code', length: 2 })
  countryCode: string;

  @ApiProperty({
    description: 'Indica si es el valor por defecto',
  })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ApiProperty({
    description: 'Indica si está activo',
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
