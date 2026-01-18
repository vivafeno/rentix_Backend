import { Module } from '@nestjs/common';
import { TenantProfileService } from './tenant-profile.service';
import { TenantProfileController } from './tenant-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantProfile } from './entities/tenant-profile.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantProfile, Company])],
  controllers: [TenantProfileController],
  providers: [TenantProfileService],
})
export class TenantProfileModule {}
