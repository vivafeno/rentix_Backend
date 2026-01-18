import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule as NestI18nModule, QueryResolver, HeaderResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// --- INFRAESTRUCTURA ---
import { HealthModule } from './health/health.module';
import { SeederModule } from './config/seeder.module';

// --- SEGURIDAD Y CONTEXTO ---
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserCompanyRoleModule } from './user-company-role/companyRole.module';
import { CompanyContextModule } from './company-context/company-context.module';

// --- DOMINIO / NEGOCIO ---
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

@Module({
  imports: [
    // 1. VARIABLES DE ENTORNO
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. PERSISTENCIA (Optimización Rentix 2026)
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
          // 🚨 CONFIGURACIÓN DE DESARROLLO SEGURO
          synchronize: !isProd, // Crea columnas nuevas sin borrar datos
          dropSchema: false,   // 🛡️ PROTECCIÓN: Evita el borrado de datos al reiniciar
          logging: !isProd ? ['query', 'error'] : false,
          namingStrategy: new SnakeNamingStrategy(),
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      }
    }),

    // 3. INTERNACIONALIZACIÓN
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
      typesOutputPath: path.join(process.cwd(), 'src/i18n/generated-i18n-types.d.ts'),
    }),

    // 4. MÓDULOS DE SISTEMA Y NEGOCIO
    SeederModule,
    HealthModule,
    AuthModule,
    UserModule,
    UserCompanyRoleModule,
    CompanyContextModule,
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