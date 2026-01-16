import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({ description: 'ID único (UUID v4)' })
  @PrimaryGeneratedColumn('uuid') // 16 bytes
  id: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' }) // 8 bytes
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última modificación' })
  @UpdateDateColumn({ name: 'updated_at' }) // 8 bytes
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Sello de auditoría de borrado' })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true, select: false }) // 8 bytes
  deletedAt?: Date | null;

  @ApiProperty({ description: 'Indicador de visibilidad operativa' })
  @Column({ name: 'is_active', type: 'boolean', default: true }) // 1 byte
  isActive: boolean;
}