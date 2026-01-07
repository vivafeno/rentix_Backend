import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, HeaderResolver, I18nModule as NestI18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { UserCompanyRoleModule } from './user-company-role/userCompanyRole.module';
import { ClientProfileModule } from './client-profile/client-profile.module';
import { AuthModule } from './auth/auth.module';
import { CompanyContextModule } from './company-context/company-context.module';
import { SeederModule } from './config/seeder.module';
import { AddressModule } from './address/address.module';
import { ContactModule } from './contact/contact.module';
import { FacturaeModule } from './facturae/facturae.module';
import { CompanyModule } from './company/company.module';
import { ClientModule } from './client/client.module';
import { PropertyModule } from './property/property.module';
import { ContractModule } from './contract/contract.module';


@Module({
  imports: [
    // 1) Config primero (lee .env)
    ConfigModule.forRoot({
      isGlobal: true, // 👈 importante para que process.env funcione en todo
    }),

    // TypeORM (PostgreSQL)
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
          synchronize: !isProd,
          logging: !isProd,
          namingStrategy: new SnakeNamingStrategy(),
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      }
    }),

    // i18n (ES por defecto)
    NestI18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        // orden de resolución del idioma
        new QueryResolver(['lang']),
        new HeaderResolver(['x-lang', 'x-locale']),
        new AcceptLanguageResolver(),
      ],
      typesOutputPath: path.join(process.cwd(), 'src/i18n/generated-i18n-types.d.ts'),
    }),

    // Seeder
    SeederModule,

    // Módulos de dominio
    HealthModule,
    HealthModule,
    UserModule,
    UserCompanyRoleModule,
    CompanyModule,
    ClientProfileModule,
    AuthModule,
    CompanyContextModule,
    AddressModule,
    ContactModule,
    FacturaeModule,
    ClientModule,
    PropertyModule,
    ContractModule,
    FacturaeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
