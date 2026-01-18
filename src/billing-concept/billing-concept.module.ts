import { Module } from '@nestjs/common';
import { BillingConceptService } from './billing-concept.service';
import { BillingConceptController } from './billing-concept.controller';
import { BillingConcept } from './entities/billing-concept.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxModule } from 'src/tax/tax.module';

@Module({
  imports: [TypeOrmModule.forFeature([BillingConcept]), TaxModule],
  controllers: [BillingConceptController],
  providers: [BillingConceptService],
  exports: [BillingConceptService],
})
export class BillingConceptModule {}
