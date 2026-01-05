import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaeParty } from 'src/facturae/entities/facturae-party.entity';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      FacturaeParty,
      UserCompanyRole,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule { }
