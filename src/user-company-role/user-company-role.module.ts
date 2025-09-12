import { Module } from '@nestjs/common';
import { UserCompanyRoleService } from './user-company-role.service';
import { UserCompanyRoleController } from './user-company-role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCompanyRole } from './entities/user-company-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCompanyRole])],
  controllers: [UserCompanyRoleController],
  providers: [UserCompanyRoleService],
})
export class UserCompanyRoleModule {}
