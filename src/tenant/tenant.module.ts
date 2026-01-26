import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';

// 🛡️ Rigor 2026: Importamos los MÓDULOS, no las entidades sueltas 
// para evitar el error de "Repository not found" o duplicidad.
import { AddressModule } from 'src/address/address.module';
import { FiscalModule } from 'src/fiscal/fiscal.module';

/**
 * @class TenantModule
 * @description Módulo base de Arrendatarios.
 * Gestiona la cuenta y la vinculación con perfiles extendidos.
 */
@Module({
  imports: [
    // 📦 Solo registramos la entidad propia del módulo
    TypeOrmModule.forFeature([Tenant]),
    
    // 🔌 Importamos la lógica de otros dominios de forma limpia
    AddressModule,
    FiscalModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [
    TenantService, 
    TypeOrmModule // Permite que TenantProfile use el repositorio de Tenant
  ],
})
export class TenantModule {}