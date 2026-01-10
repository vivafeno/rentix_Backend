import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FacturaeController } from './facturae.controller';
import { FacturaeService } from './facturae.service';
import { FacturaeParty } from './entities/facturaeParty.entity';

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
    TypeOrmModule.forFeature([FacturaeParty]),
  ],
  controllers: [FacturaeController],
  providers: [FacturaeService],
  exports: [
    TypeOrmModule,
    FacturaeService,
  ],
})
export class FacturaeModule {}
