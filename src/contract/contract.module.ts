import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';

// Entidades necesarias para la validación cruzada en el Service
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';

/**
 * @module ContractModule
 * @description Módulo central de gestión de arrendamientos de Rentix 2026.
 * Orquesta la lógica entre inmuebles, inquilinos e impuestos para habilitar
 * el motor de facturación Veri*factu.
 */
@Module({
  imports: [
    /**
     * Registramos Contract y sus dependencias directas para permitir 
     * validaciones de integridad referencial dentro del mismo contexto.
     */
    TypeOrmModule.forFeature([
      Contract, 
      Property, 
      Tenant, 
      Tax
    ]),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [
    /**
     * Exportamos el servicio para permitir que el futuro InvoiceModule
     * consulte términos contractuales para la generación de facturas.
     */
    ContractService
  ],
})
export class ContractModule {}