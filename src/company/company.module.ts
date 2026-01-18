import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

// Entidades (Core de la transacción atómica)
import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';

/**
 * @description Módulo de gestión de Patrimonios.
 * Registra la infraestructura necesaria para la creación atómica de sujetos legales.
 * @version 2026.1.17
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      FiscalEntity,
      Address,
      CompanyRoleEntity,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
