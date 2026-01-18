import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  I18nModule as NestI18nModule,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// --- INFRAESTRUCTURA Y SISTEMA ---
import { HealthModule } from './health/health.module';
import { SeederModule } from './config/seeder.module';

// --- SEGURIDAD Y CONTEXTO ---
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserCompanyRoleModule } from './user-company-role/companyRole.module';
// 🛡️ Eliminado CompanyContextModule por error TS2307 (Módulo inexistente o refactorizado)

// --- DOMINIO / NEGOCIO (Rentix 2026) ---
import { CompanyModule } from './company/company.module';
import { AddressModule } from './address/address.module';
import { ContactModule } from './contact/contact.module';
import { PropertyModule } from './property/property.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantProfileModule } from './tenant-profile/tenant-profile.module';
import { ContractModule } from './contract/contract.module';
import { TaxModule } from './tax/tax.module';
import { BillingConceptModule } from './billing-concept/billing-concept.module';
import { FacturaeModule } from './fiscal/fiscal.module';

/**
 * @class AppModule
 * @description Módulo raíz de Rentix 2026. Orquesta la infraestructura,
 * seguridad multi-tenant y los dominios de negocio patrimonial.
 * @author Rentix 2026
 * @version 2026.1.18
 */
@Module({
  imports: [
    // 1. VARIABLES DE ENTORNO (Global)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. PERSISTENCIA: PostgreSQL + TypeORM con SnakeNaming para Veri*factu
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          database: config.get<string>('DB_NAME'),
          schema: 'public',
          autoLoadEntities: true,
          // 🛡️ Desarrollo Seguro: Sincronización solo fuera de producción
          synchronize: !isProd,
          dropSchema: false,
          logging: !isProd ? ['query', 'error'] : false,
          namingStrategy: new SnakeNamingStrategy(),
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    // 3. INTERNACIONALIZACIÓN (i18n)
    NestI18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-lang', 'x-locale']),
        new AcceptLanguageResolver(),
      ],
      typesOutputPath: path.join(
        process.cwd(),
        'src/i18n/generated-i18n-types.d.ts',
      ),
    }),

    // 4. MÓDULOS DE SISTEMA
    SeederModule,
    HealthModule,

    // 5. MÓDULOS DE SEGURIDAD
    AuthModule,
    UserModule,
    UserCompanyRoleModule,

    // 6. MÓDULOS DE DOMINIO OPERATIVO
    CompanyModule,
    AddressModule,
    ContactModule,
    PropertyModule,
    TenantModule,
    TenantProfileModule,
    ContractModule,
    TaxModule,
    BillingConceptModule,
    FacturaeModule,
  ],
})
export class AppModule {}
