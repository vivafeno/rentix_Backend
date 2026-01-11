import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FiscalIdentityController } from './fiscalIdentity.controller';
import { FiscalIdentityService } from './fiscalIdentity.service';
import { FiscalIdentity } from './entities/fiscalIdentity.entity';

/**
 * FacturaeModule
 *
 * Responsabilidad:
 * - Gestión de identidades fiscales (FacturaeParty)
 * - Base para facturación electrónica (Facturae)
 *
 * Nota de arquitectura:
 * - Exporta TypeOrmModule para permitir
 *   uso del repositorio FacturaeParty
 *   desde otros módulos (Company, seeds, etc.)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FiscalIdentity]),
  ],
  controllers: [FiscalIdentityController],
  providers: [FiscalIdentityService],
  exports: [
    TypeOrmModule,
    FiscalIdentityService,
  ],
})
export class FacturaeModule {}
