import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class FiscalRateEntity
 * @description Entidad base abstracta para la gestión de tipos impositivos (IVA/IRPF).
 * Rigor Rentix 2026: Implementa el estándar de precisión decimal y auditoría temporal.
 */
export abstract class FiscalRateEntity {
  /**
   * @description Identificador único universal.
   */
  @ApiProperty({ description: 'ID único de la tasa fiscal', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 🚩 Rigor Rentix: !

  /**
   * @description Código identificador del tipo fiscal.
   */
  @ApiProperty({
    description: 'Tipo fiscal (ej: IVA_GENERAL, IRPF)',
    example: 'IVA_GENERAL',
  })
  @Column()
  tipo!: string; // 🚩 Rigor Rentix: !

  /**
   * @description Nombre descriptivo para visualización en facturas y recibos.
   */
  @ApiProperty({
    description: 'Descripción legible del impuesto',
    example: 'IVA general (21%)',
  })
  @Column()
  descripcion!: string; // 🚩 Rigor Rentix: !

  /**
   * @description Valor porcentual de la tasa.
   */
  @ApiProperty({
    description: 'Porcentaje aplicado (0.00 a 100.00)',
    example: 21,
  })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } // Evita strings en el retorno de decimales
  })
  porcentaje!: number; // 🚩 Rigor Rentix: !

  /**
   * @description Código de país según estándar ISO para exportación Veri*factu.
   */
  @ApiProperty({
    description: 'País de aplicación (ISO-3166-1 alpha-2)',
    example: 'ES',
  })
  @Column({ name: 'country_code', length: 2 })
  countryCode!: string; // 🚩 Rigor Rentix: !

  /**
   * @description Marca de configuración predeterminada.
   */
  @ApiProperty({
    description: 'Indica si es el valor seleccionado por defecto en el sistema',
  })
  @Column({ name: 'is_default', default: false })
  isDefault!: boolean; // 🚩 Rigor Rentix: !

  /**
   * @description Estado de visibilidad operativa.
   */
  @ApiProperty({
    description: 'Indica si la tasa está habilitada para su uso',
  })
  @Column({ name: 'is_active', default: true })
  isActive!: boolean; // 🚩 Rigor Rentix: !

  /* ─────────────────────────────────────────────────────────────────
   * 🕒 AUDITORÍA TEMPORAL
   * ───────────────────────────────────────────────────────────────── */

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}