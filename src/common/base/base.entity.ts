import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * BaseEntity
 *
 * Entidad base abstracta para todas las entidades del sistema.
 * Define campos comunes de auditoría y estado.
 *
 * ⚠️ IMPORTANTE:
 * - Esta clase NO debe usarse directamente como DTO.
 * - Los DTOs deben declarar explícitamente los campos que exponen.
 */
export abstract class BaseEntity {

  /* ------------------------------------------------------------------
   * IDENTIFICADOR
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Identificador único de la entidad',
    format: 'uuid',
    example: 'c3f6c9c1-9e9a-4a4b-8f88-3b8b9e7b6c21',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ------------------------------------------------------------------
   * AUDITORÍA
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Fecha de creación del registro',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación lógica (soft delete)',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  /* ------------------------------------------------------------------
   * ESTADO
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Indica si el registro está activo',
    example: true,
    default: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
