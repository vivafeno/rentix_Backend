// src/config/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { FiscalIdentity } from '../facturae/entities/fiscalIdentity.entity';
import { Address } from 'src/address/entities/address.entity';
import { VatRate } from 'src/common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from 'src/common/catalogs/taxes/withholding-rate/withholding-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Company,
    CompanyRoleEntity,
    FiscalIdentity,
    Address,
    VatRate,
    WithholdingRate,
  ])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule { }
