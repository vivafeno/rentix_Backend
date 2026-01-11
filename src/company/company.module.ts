import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { Company } from './entities/company.entity';
import { Address } from 'src/address/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      FiscalIdentity,
      Address,  
      CompanyRoleEntity,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule { }
