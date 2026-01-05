import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WithholdingRate } from './withholding-rate.entity';
import { WithholdingRateService } from './withholding-rate.service';
import { WithholdingRateController } from './withholding-rate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WithholdingRate])],
  controllers: [WithholdingRateController],
  providers: [WithholdingRateService],
  exports: [WithholdingRateService],
})
export class WithholdingRateModule {}
