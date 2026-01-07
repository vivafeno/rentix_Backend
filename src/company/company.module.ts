import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaeParty } from 'src/facturae/entities/facturaeParty.entity';
import { UserCompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity';
import { Company } from './entities/company.entity';
import { Address } from 'src/address/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      FacturaeParty,
      Address,  
      UserCompanyRole,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule { }
