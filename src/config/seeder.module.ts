// src/config/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { UserCompanyRole } from '../user-company-role/entities/user-company-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, UserCompanyRole])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
