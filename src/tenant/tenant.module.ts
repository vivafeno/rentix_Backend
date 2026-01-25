import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';

// Entidades necesarias para la integridad referencial del Tenant
import { Tenant } from './entities/tenant.entity';
import { Address } from 'src/address/entities/address.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';

/**
 * @class TenantModule
 * @description Módulo de gestión de Arrendatarios (Tenants).
 * Centraliza la relación entre empresas, identidades fiscales y direcciones.
 * @version 2026.01.22
 * @author Rentix 2026
 */
@Module({
  imports: [
    /** * 📦 Persistencia: Registramos Tenant, Address y FiscalEntity.
     * Esto permite que el TenantService gestione la creación atómica y 
     * las relaciones cargadas (eager/lazy) sin fallos de metadatos.
     */
    TypeOrmModule.forFeature([
      Tenant, 
      Address, 
      FiscalEntity
    ]),
  ],
  controllers: [
    /** 📡 API Endpoints para el CRM de inquilinos */
    TenantController,
  ],
  providers: [
    /** ⚙️ Motor de lógica y blindaje Multi-tenant */
    TenantService,
  ],
  exports: [
    /** * 📤 Exportamos el Service para que el módulo de 'Contract'
     * pueda validar la solvencia y datos fiscales del inquilino.
     */
    TenantService,
    TypeOrmModule // Exportamos para compartir acceso a repositorios si es necesario
  ],
})
export class TenantModule {}