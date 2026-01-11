// src/company-context/company-context.module.ts
import { Module } from '@nestjs/common';
import { CompanyContextService } from './company-context.service';
import { CompanyContextController } from './company-context.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([CompanyRoleEntity, User]),
    
  ],
  controllers: [CompanyContextController],
  providers: [CompanyContextService],
})
export class CompanyContextModule {}
