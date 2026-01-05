import { Module } from '@nestjs/common';
import { ClientProfileService } from './client-profile.service';
import { ClientProfileController } from './client-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfile, Company,])],
  controllers: [ClientProfileController],
  providers: [ClientProfileService],
})
export class ClientProfileModule { }
