import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyRoleEntity } from './entities/userCompanyRole.entity';
import { UserCompanyRoleService } from './companyRole.service';
import { UserCompanyRoleController } from './companyRole.controller';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyRoleEntity, User, Company])],
  controllers: [UserCompanyRoleController],
  providers: [UserCompanyRoleService],
})
export class UserCompanyRoleModule {}
