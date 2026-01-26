import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @class BaseEntity
 * @description Entidad base abstracta para la persistencia de datos.
 * Establece el estándar de auditoría y trazabilidad para todo el ecosistema Rentix.
 * * Estándares Blueprint 2026:
 * - Soft-Delete nativo para integridad referencial.
 * - Precisión 'timestamptz' para soporte multi-zona horaria.
 * - Aserción de asignación (!) para cumplimiento de TS Strict.
 */
export abstract class BaseEntity {
  /**
   * @description Identificador único universal (v4).
   * Generado automáticamente por la base de datos.
   */
  @ApiProperty({ description: 'ID único (UUID v4)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 🚩 Rigor Rentix: ! porque la DB siempre lo genera

  /**
   * @description Marca temporal de inserción del registro (ISO 8601).
   */
  @ApiProperty({ description: 'Fecha de creación de registro' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date; // 🚩 Rigor Rentix: ! asignado automáticamente en el insert

  /**
   * @description Marca temporal de la última actualización del registro.
   */
  @ApiProperty({ description: 'Fecha de última modificación' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date; // 🚩 Rigor Rentix: ! gestionado por TypeORM

  /**
   * @description Sello de auditoría para borrado lógico.
   * Si tiene valor, el registro se considera "eliminado" pero permanece en DB para integridad fiscal.
   */
  @ApiPropertyOptional({ description: 'Sello de auditoría de borrado (Soft Delete)' })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
    select: true,
  })
  deletedAt?: Date | null; // 🚩 Se mantiene ? porque es opcional por diseño

  /**
   * @description Indicador de disponibilidad operativa.
   * Permite desactivar entidades sin borrarlas (ej. suspender una cuenta).
   */
  @ApiProperty({ description: 'Indicador de visibilidad y estado operativo', default: true })
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean; // 🚩 Rigor Rentix: ! tiene un default: true
}