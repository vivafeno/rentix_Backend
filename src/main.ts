import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { i18nValidationErrorFactory } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { SeederService } from './config/seeder.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * @function bootstrap
 * @description Punto de entrada Rentix 2026.
 * Implementa Serialización Atómica y Gestión de Ciclo de Vida de Procesos.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  // 1. 🏗️ Inicialización de la Aplicación Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const reflector = app.get(Reflector);

  // 2. 🛡️ Serialización Global
  // Filtra automáticamente campos con @Exclude() (ej. password) para Signals limpios.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // 3. 🌍 Filtro de Excepciones Nativo (Sin RxJS)
  // Normaliza todos los errores al contrato que espera el Frontend.
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // 4. 🛑 Gestión de Apagado (Shutdown Hooks) - [CRÍTICO PARA PDF SINGLETON]
  // Permite que PdfService.onModuleDestroy() cierre Puppeteer correctamente.
  app.enableShutdownHooks();

  // 5. ⚙️ Configuración de CORS
  const rawOrigins = configService.get<string | string[]>('cors.origins') || 'http://localhost:4200';
  const allowedOrigins = Array.isArray(rawOrigins) 
    ? rawOrigins 
    : rawOrigins.split(',').map(o => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'x-custom-lang'],
  });

  // 6. 🛠️ Pipes de Validación (Rigor 2026)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: i18nValidationErrorFactory, 
    }),
  );

  // 7. 📖 Swagger UI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rentix API')
    .setDescription('Arquitectura Multi-tenant 2026 - Contratos Atómicos y Signals')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // 8. 🌱 Protocolo de Seeding (Sincronización de Base de Datos)
  const seeder = app.get(SeederService);
  await seeder.seed();

  // 9. 🚀 Activos Estáticos (Logo, Facturas almacenadas, etc.)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  
  logger.log(`==========================================================`);
  logger.log(`🚀 API Rentix: http://localhost:${port}`);
  logger.log(`🚦 Swagger: http://localhost:${port}/api-docs`);
  logger.log(`==========================================================`);
}

bootstrap().catch((err: unknown) => {
  console.error('Fallo en el arranque del sistema:', err);
  process.exit(1);
});