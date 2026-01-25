import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { i18nValidationErrorFactory, I18nValidationExceptionFilter } from 'nestjs-i18n';

import { AppModule } from './app.module';
import { SeederService } from './config/seeder.service';

/**
 * @function bootstrap
 * @description Punto de entrada principal Rentix 2026.
 * Implementa el Mandamiento de Certeza: Configuración explícita y tipado defensivo.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // 1. ⚙️ Inyección de ConfigService
  const configService = app.get(ConfigService);

  // 2. 🛡️ Configuración de CORS Dinámico (Sanitizado Rigor 2026)
  // Resolvemos el problema del string vs array del .env
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

  // 3. 🛠️ Pipes de Validación Global con soporte i18n
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: i18nValidationErrorFactory, 
    }),
  );

  // 4. 🌍 Filtro de Excepciones para traducciones automáticas
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  // 5. 📖 Configuración de Swagger (OpenAPI 3.0)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rentix API')
    .setDescription('Arquitectura de Gestión Inmobiliaria Multi-tenant (Blueprint 2026)')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // 6. 🌱 Protocolo de Seeding (Nodo Raíz)
  const seeder = app.get(SeederService);
  await seeder.seed();

  // 7. 🚀 Resolución de Red y Arranque
  // Nota: Ajustamos las llaves de acceso para evitar el log 'undefined'
  const port = configService.get<number>('app.port') || 3000;
  const env = configService.get<string>('app.node_env') || 'development';

  await app.listen(port);
  
  // --- BLOQUE DE LOGS RENTIX 2026 ---
  logger.log(`==========================================================`);
  logger.log(`🚀 Rentix API activa en: http://localhost:${port}/api`);
  logger.log(`🌍 Entorno: ${env.toUpperCase()}`);
  logger.log(`🛡️  CORS whitelist: [${allowedOrigins.join(', ')}]`);
  logger.log(`🚦 Swagger UI: http://localhost:${port}/api`);
  logger.log(`==========================================================`);
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger('BootstrapError');
  logger.error('Fallo catastrófico en el arranque del sistema');
  console.error(err);
  process.exit(1);
});