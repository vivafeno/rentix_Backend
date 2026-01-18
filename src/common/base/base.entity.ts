import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad base abstracta para la persistencia de datos.
 * * Estándares Blueprint 2026:
 * - Implementación de Soft-Delete nativo mediante decoradores de TypeORM.
 * - Tipado de precisión temporal 'timestamptz' para cumplimiento de estándares ISO.
 * - Visibilidad de campos de auditoría para lógica de negocio en Services.
 * * @version 1.1.0
 * @author Rentix
 */
export abstract class BaseEntity {
  /**
   * Identificador único universal (v4).
   */
  @ApiProperty({ description: 'ID único (UUID v4)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Marca temporal de inserción del registro.
   */
  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ 
    name: 'created_at', 
    type: 'timestamptz' 
  })
  createdAt: Date;

  /**
   * Marca temporal de la última actualización del registro.
   */
  @ApiProperty({ description: 'Fecha de última modificación' })
  @UpdateDateColumn({ 
    name: 'updated_at', 
    type: 'timestamptz' 
  })
  updatedAt: Date;

  /**
   * Sello de auditoría para borrado lógico.
   * La propiedad select se mantiene en true para permitir validaciones de estado en la capa de servicio.
   */
  @ApiPropertyOptional({ description: 'Sello de auditoría de borrado' })
  @DeleteDateColumn({ 
    name: 'deleted_at', 
    type: 'timestamptz', 
    nullable: true,
    select: true 
  })
  deletedAt?: Date | null;

  /**
   * Indicador de disponibilidad operativa para lógica de filtrado rápido.
   */
  @ApiProperty({ description: 'Indicador de visibilidad operativa' })
  @Column({ 
    name: 'is_active', 
    type: 'boolean', 
    default: true 
  })
  isActive: boolean;
}