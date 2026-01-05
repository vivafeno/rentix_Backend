import { Module } from '@nestjs/common';

import { VatRateModule } from './vat-rate/vat-rate.module';
import { WithholdingRateModule } from './withholding-rate/withholding-rate.module';

@Module({
  imports: [VatRateModule, WithholdingRateModule],
  exports: [VatRateModule, WithholdingRateModule],
})
export class TaxesModule {}
