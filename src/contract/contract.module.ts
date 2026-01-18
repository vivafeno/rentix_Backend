import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contract } from './entities/contract.entity';

import { TenantModule } from '../tenant/tenant.module';
import { PropertyModule } from '../property/property.module';
import { CompanyModule } from '../company/company.module';
import { TaxModule } from 'src/tax/tax.module';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Company } from 'src/company/entities/company.entity';
import { Tax } from 'src/tax/entities/tax.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, Property, Tenant, Company, Tax,]),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule { }