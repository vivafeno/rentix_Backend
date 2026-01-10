import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserCompanyRole } from './entities/userCompanyRole.entity';
import { UserCompanyRoleService } from './userCompanyRole.service';
import { UserCompanyRoleController } from './userCompanyRole.controller';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCompanyRole,
      User,
      Company,
    ]),
  ],
  controllers: [UserCompanyRoleController],
  providers: [UserCompanyRoleService],
})
export class UserCompanyRoleModule {}
