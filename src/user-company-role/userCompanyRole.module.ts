import { Module } from '@nestjs/common';
import { UserCompanyRoleService } from './userCompanyRole.service';
import { UserCompanyRoleController } from './userCompanyRole.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCompanyRole } from './entities/userCompanyRole.entity';
import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCompanyRole,
      User,
      Company,])],
  controllers: [UserCompanyRoleController],
  providers: [UserCompanyRoleService],
})
export class UserCompanyRoleModule {}
