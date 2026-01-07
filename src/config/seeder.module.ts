// src/config/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { UserCompanyRole } from '../user-company-role/entities/userCompanyRole.entity';
import { FacturaeParty } from '../facturae/entities/facturaeParty.entity';
import { Address } from 'src/address/entities/address.entity';
import { VatRate } from 'src/common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from 'src/common/catalogs/taxes/withholding-rate/withholding-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Company,
    UserCompanyRole,
    FacturaeParty,
    Address,
    VatRate,
    WithholdingRate,
  ])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule { }
