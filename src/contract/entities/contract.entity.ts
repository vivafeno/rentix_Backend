import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Property } from '../../property/entities/property.entity';
import { Tax } from '../../tax/entities/tax.entity';
import { 
  ContractStatus, 
  BillingPeriod, 
  ContractType, 
  PaymentMethod 
} from '../enums';

@Entity('contracts')
export class Contract extends BaseEntity {
  // --------------------------------------------------------------------------
  // 1. IDENTIFICACIÓN Y TIPO
  // --------------------------------------------------------------------------
  @ApiProperty({ 
    description: 'Referencia única del contrato (ej. Código interno)', 
    example: 'ALQ-2026/001' 
  })
  @Column({ unique: true })
  reference: string;

  @ApiProperty({ 
    description: 'Clasificación del contrato', 
    enum: ContractType,
    example: ContractType.ALQUILER
  })
  @Column({ type: 'enum', enum: ContractType, default: ContractType.ALQUILER })
  type: ContractType;

  // --------------------------------------------------------------------------
  // 2. CIERRE DE SEGURIDAD (RELACIONES CLAVE)
  // --------------------------------------------------------------------------
  
  @ApiProperty({ description: 'ID de la Empresa propietaria (Owner del dato)' })
  @Index() 
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ description: 'ID del Cliente/Inquilino asociado' })
  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'client_id' })
  client: Tenant;

  @ApiProperty({ description: 'ID del Inmueble/Propiedad objeto del contrato' })
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  // --------------------------------------------------------------------------
  // 3. DATOS ECONÓMICOS (LA "LÍNEA MAESTRA")
  // --------------------------------------------------------------------------

  @ApiProperty({ description: 'Importe de la renta mensual base (sin impuestos)', example: 1000.00 })
  @Column({ name: 'monthly_rent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyRent: number;

  @ApiProperty({ description: 'Importe de la fianza legal depositada', example: 2000.00 })
  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  depositAmount: number;

  // --- IMPUESTOS (Vinculación con Módulo Tax) ---

  @ApiProperty({ 
    description: 'ID del Impuesto principal (IVA) a aplicar sobre la renta. Viene de la entidad Tax.',
    example: 'uuid-del-iva-21'
  })
  @Column({ name: 'tax_id', type: 'uuid', nullable: true })
  taxId: string;

  @ManyToOne(() => Tax)
  @JoinColumn({ name: 'tax_id' })
  tax: Tax;

  @ApiProperty({ 
    description: 'ID de la Retención (IRPF) a restar de la renta. Viene de la entidad Tax.', 
    required: false,
    example: 'uuid-del-irpf-19'
  })
  @Column({ name: 'retention_id', type: 'uuid', nullable: true })
  retentionId: string;

  @ManyToOne(() => Tax)
  @JoinColumn({ name: 'retention_id' })
  retention: Tax;

  // --------------------------------------------------------------------------
  // 4. OPERATIVA DE PAGO Y BANCOS (FACTURAE)
  // --------------------------------------------------------------------------

  @ApiProperty({ description: 'Método de pago oficial (01, 03, etc.)', enum: PaymentMethod })
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.DOMICILIACION })
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    description: 'UUID de la Cuenta Bancaria del CLIENTE. Se usará para girar recibos (Domiciliación).', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'tenant_bank_account_id', type: 'uuid', nullable: true })
  tenantBankAccountId: string; 

  @ApiProperty({ 
    description: 'UUID de la Cuenta Bancaria de la EMPRESA. Se mostrará en la factura para recibir Transferencias.', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ name: 'company_bank_account_id', type: 'uuid', nullable: true })
  companyBankAccountId: string;

  // --------------------------------------------------------------------------
  // 5. CICLO DE VIDA, FECHAS Y AUTOMATIZACIÓN
  // --------------------------------------------------------------------------

  @ApiProperty({ description: 'Estado del contrato', enum: ContractStatus })
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.BORRADOR })
  status: ContractStatus;

  @ApiProperty({ description: 'Fecha de inicio de vigencia', example: '2026-01-01' })
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'Fecha de fin de contrato (null si es indefinido)', required: false })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @ApiProperty({ description: 'Día programado para emitir la factura mensual (1-28)', example: 1 })
  @Column({ name: 'billing_day', type: 'int', default: 1 })
  billingDay: number;

  @ApiProperty({ description: 'Frecuencia de facturación', enum: BillingPeriod })
  @Column({ name: 'billing_period', type: 'enum', enum: BillingPeriod, default: BillingPeriod.MENSUAL })
  billingPeriod: BillingPeriod;

  @ApiProperty({ description: 'Fecha de la última factura de renta generada con éxito', required: false })
  @Column({ name: 'last_billing_date', type: 'date', nullable: true })
  lastBillingDate: Date;

  // --- AUTOMATIZACIÓN (Tu "Trigger" seleccionable) ---

  @ApiProperty({ description: 'Si es TRUE, el sistema generará facturas automáticamente según billingDay' })
  @Column({ name: 'is_auto_billing_enabled', default: false })
  isAutoBillingEnabled: boolean;

  @ApiProperty({ description: 'Fecha límite hasta la cual se permite la autofacturación (ej. Fin de los 12 meses)' })
  @Column({ name: 'auto_billing_until', type: 'date', nullable: true })
  autoBillingUntil: Date;

  // --------------------------------------------------------------------------
  // 6. DOCUMENTACIÓN Y AUDITORÍA
  // --------------------------------------------------------------------------

  @ApiProperty({ description: 'URL al PDF del contrato firmado', required: false })
  @Column({ name: 'document_url', nullable: true })
  documentUrl: string;
}