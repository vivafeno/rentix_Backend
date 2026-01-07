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
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FacturaeParty]),
  ],
  controllers: [FacturaeController],
  providers: [FacturaeService],
})
export class FacturaeModule {}
