import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

// 🛡️ Entidades: Requeridas para la persistencia atómica (Rentix 2026)
import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';
import { Address } from 'src/address/entities/address.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';

// 🛡️ Seguridad: Contexto de autenticación y roles
import { AuthModule } from 'src/auth/auth.module';

/**
 * @class CompanyModule
 * @description Módulo de gestión de Patrimonios y Sujetos Legales.
 * Orquesta la infraestructura para la creación atómica y el control de ciclo de vida (SaaS).
 * @version 2026.01.22
 * @author Rentix 2026
 */
@Module({
  imports: [
    /** * 📦 Persistencia: Registra las entidades necesarias para que el DataSource 
     * maneje la transacción atómica de Company + Fiscal + Address.
     * Es vital que CompanyRoleEntity esté aquí para la asignación de OWNER.
     */
    TypeOrmModule.forFeature([
      Company,
      FiscalEntity,
      Address,
      CompanyRoleEntity,
    ]),

    /** * 🛡️ Blindaje: Proporciona la lógica de validación de JWT y roles.
     * Sin esto, el decorador @Auth() en el controlador fallará.
     */
    AuthModule,
  ],
  controllers: [
    /** 📡 Exposición: Endpoints operativos y de infraestructura (Kill Switch). */
    CompanyController
  ],
  providers: [
    /** ⚙️ Lógica: Servicio orquestador con aislamiento de datos. */
    CompanyService
  ],
  exports: [
    /** 📤 Exportación: Permite que otros módulos (ej. Facturación) validen el estado de la empresa. */
    CompanyService, 
    TypeOrmModule
  ],
})
export class CompanyModule {}