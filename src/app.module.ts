import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, HeaderResolver, I18nModule as NestI18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { UserCompanyRoleModule } from './user-company-role/user-company-role.module';
import { CompanyModule } from './company/company.module';
import { ClientProfileModule } from './client-profile/client-profile.module';
import { AuthModule } from './auth/auth.module';

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
  typesOutputPath: path.join(__dirname, 'i18n', 'generated-i18n-types.d.ts'),
}),

  // Módulos de dominio   d
  HealthModule,
  HealthModule,
  UserModule,
  UserCompanyRoleModule,
  CompanyModule,
  ClientProfileModule,
  AuthModule,   
  ],
controllers: [],
  providers: [],
})
export class AppModule { }
