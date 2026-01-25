import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyRoleEntity } from './entities/user-company-role.entity';
import { UserCompanyRoleService } from './user-company-role.service';
import { UserCompanyRoleController } from './user-company-role.controller';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyRoleEntity, User, Company])],
  controllers: [UserCompanyRoleController],
  providers: [UserCompanyRoleService],
})
export class UserCompanyRoleModule {}
