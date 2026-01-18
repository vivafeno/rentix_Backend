import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { FrecuenciaPago, MetodoPago, ContractStatus } from '../enums/contract.enums';

/**
 * @class Contract
 * @description Entidad maestra que regula la relación contractual entre arrendador e inquilinos.
 * Almacena las condiciones económicas y temporales para el motor de facturación Veri*factu.
 * @author Rentix 2026
 * @version 1.0.1
 */
@Entity('contracts')
export class Contract extends BaseEntity {

  /* --- RELACIONES CORE --- */

  /** @property companyId - Referencia al propietario legal (Multi-tenancy) */
  @ApiProperty({ description: 'ID de la empresa propietaria' })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  propietario: Company;

  /** @property propertyId - Referencia al activo inmobiliario arrendado */
  @ApiProperty({ description: 'ID del activo inmobiliario objeto del contrato' })
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  inmueble: Property;

  /** @property inquilinos - Colección de arrendatarios firmantes */
  @ApiProperty({ type: () => [Tenant], description: 'Arrendatarios vinculados' })
  @ManyToMany(() => Tenant, { eager: true })
  @JoinTable({
    name: 'contract_tenants',
    joinColumn: { name: 'contract_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tenant_id', referencedColumnName: 'id' }
  })
  inquilinos: Tenant[];

  /* --- ECONOMÍA Y FISCALIDAD --- */

  /** @property rentaMensual - Importe neto de la renta mensual */
  @ApiProperty({ example: 1200.00, description: 'Base imponible de la renta' })
  @Column({ 
    name: 'renta_mensual', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  rentaMensual: number;

  /** @property fianza - Depósito de garantía legal */
  @ApiProperty({ example: 2400.00, description: 'Importe de fianza' })
  @Column({ 
    name: 'fianza', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0, 
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) }
  })
  fianza: number;

  @ApiProperty({ description: 'Relación con el impuesto IVA aplicado' })
  @ManyToOne(() => Tax)
  @JoinColumn({ name: 'tax_iva_id' })
  iva: Tax;

  @ApiProperty({ description: 'Relación con la retención IRPF (si aplica)' })
  @ManyToOne(() => Tax, { nullable: true })
  @JoinColumn({ name: 'tax_irpf_id' })
  retencion: Tax;

  /* --- GESTIÓN Y ESTADOS (ENUMS) --- */

  /** @property frecuenciaPago - Ciclo de facturación */
  @ApiProperty({ 
    enum: FrecuenciaPago, 
    enumName: 'FrecuenciaPago' 
  })
  @Column({ type: 'enum', enum: FrecuenciaPago, default: FrecuenciaPago.MENSUAL })
  frecuenciaPago: FrecuenciaPago;

  /** @property metodoPago - Vía de liquidación del recibo */
  @ApiProperty({ 
    enum: MetodoPago, 
    enumName: 'MetodoPago' 
  })
  @Column({ type: 'enum', enum: MetodoPago, default: MetodoPago.TRANSFERENCIA })
  metodoPago: MetodoPago;

  /** @property estado - Situación administrativa del contrato */
  @ApiProperty({ 
    enum: ContractStatus, 
    enumName: 'ContractStatus' 
  })
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.ACTIVO })
  estado: ContractStatus;

  /* --- TEMPORALIDAD --- */

  /** @property diaFacturacion - Día del mes pactado para el devengo */
  @ApiProperty({ example: 5 })
  @Column({ name: 'dia_facturacion', type: 'int', default: 1 })
  diaFacturacion: number;

  @ApiProperty({ example: '2026-02-01' })
  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @ApiProperty({ example: 12, description: 'Vigencia pactada en meses' })
  @Column({ name: 'duracion_meses', type: 'int' })
  duracionMeses: number;

  @ApiProperty({ description: 'Fecha de fin de contrato calculada' })
  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  /* --- LOGICA ATÓMICA --- */

  /**
   * @method actualizarMetadatos
   * @description Hook para sincronizar el vencimiento antes de cada persistencia.
   */
  @BeforeInsert()
  @BeforeUpdate()
  actualizarMetadatos(): void {
    if (this.fechaInicio && this.duracionMeses) {
      const inicio = new Date(this.fechaInicio);
      inicio.setMonth(inicio.getUTCMonth() + this.duracionMeses);
      this.fechaVencimiento = inicio;
    }
  }

  /**
   * @getter tiempoRestanteDias
   * @description Calcula el delta entre hoy y el vencimiento para avisos en UI.
   */
  get tiempoRestanteDias(): number {
    const hoy = new Date();
    const diferencia = new Date(this.fechaVencimiento).getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
  }
}