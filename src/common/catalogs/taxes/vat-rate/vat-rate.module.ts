import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VatRate } from './vat-rate.entity';
import { VatRateService } from './vat-rate.service';
import { VatRateController } from './vat-rate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VatRate])],
  controllers: [VatRateController],
  providers: [VatRateService],
  exports: [VatRateService],
})
export class VatRateModule {}
