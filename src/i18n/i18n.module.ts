import { Module, Logger } from '@nestjs/common';
import * as path from 'path';
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';

@Module({
  imports: [
 // src/config/i18n.module.ts
NestI18nModule.forRoot({
  fallbackLanguage: 'es',
  loaderOptions: {
    // Esto garantiza que encuentre la carpeta i18n en la raíz del proyecto
    path: path.join(process.cwd(), 'i18n/'),
    watch: true,
  },
  resolvers: [AcceptLanguageResolver],
  // Asegúrate de que esta ruta existe o créala manualmente
  typesOutputPath: path.join(process.cwd(), 'src/generated/i18n.generated.ts'),
}),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {
  private readonly logger = new Logger('I18nInfrastructure');

  constructor() {
    const jsonPath = path.resolve(process.cwd(), 'i18n/');
    const typesPath = path.resolve(process.cwd(), 'src/generated/i18n.generated.ts');
    
    this.logger.log('--- RIGOR RENTIX 2026: I18N CHECK ---');
    this.logger.log(`📁 Buscando diccionarios en: ${jsonPath}`);
    this.logger.log(`📄 Generando tipos en: ${typesPath}`);
    this.logger.log('--------------------------------------');
  }
}