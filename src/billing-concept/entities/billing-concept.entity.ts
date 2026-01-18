import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tax } from '../../tax/entities/tax.entity';

@Entity('billing_concepts')
export class BillingConcept {
  @ApiProperty({ example: 'uuid-concept' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'RENTA' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Arrendamiento mensual local' })
  @Column()
  label: string;

  @ApiProperty({ example: 1000.0 })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  defaultPrice: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isPriceEditable: boolean;

  @ApiProperty({ example: true })
  @Column({ default: false })
  requiresPeriod: boolean;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isUniquePerPeriod: boolean;

  @ApiProperty({ example: 'S', enum: ['P', 'S'] })
  @Column({ type: 'varchar', length: 1, default: 'S' })
  itemType: string;

  // Relaciones con Eager Loading para que el Front reciba el objeto Tax completo
  @ManyToOne(() => Tax, { eager: true, nullable: false })
  @JoinColumn({ name: 'default_tax_id' })
  defaultTax: Tax;

  @ManyToOne(() => Tax, { eager: true, nullable: true })
  @JoinColumn({ name: 'default_retention_id' })
  defaultRetention: Tax;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Fecha de borrado lógico' })
  @DeleteDateColumn()
  deletedAt: Date;
}
