import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FiscalIdentityController } from './fiscal.controller';
import { FiscalService } from './fiscal.service';
import { FiscalEntity } from './entities/fiscal.entity';

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
  imports: [TypeOrmModule.forFeature([FiscalEntity])],
  controllers: [FiscalIdentityController],
  providers: [FiscalService],
  exports: [TypeOrmModule, FiscalService],
})
export class FiscalModule {}
