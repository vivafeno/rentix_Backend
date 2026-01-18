import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeederService } from './config/seeder.service';
import { ValidationPipe, Logger } from '@nestjs/common';

/**
 * @function bootstrap
 * @description Punto de entrada principal de Rentix API.
 * Configura Swagger, validaciones globales, CORS y ejecución de seeders.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 🛡️ Configuración de CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // 📖 Configuración de Swagger (OpenAPI 3.0)
  const config = new DocumentBuilder()
    .setTitle('Rentix API')
    .setDescription('Documentación de la API Rentix (Blueprint 2026)')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 🛠️ Pipes de Validación Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 🌱 Ejecución de Semillas (Seeder)
  const seeder = app.get(SeederService);
  await seeder.seed();

  // 🚀 Arranque del servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Rentix API corriendo en: http://localhost:${port}/api`);
}

/**
 * @description Ejecución segura de la función bootstrap con captura de errores.
 * Resuelve el error @typescript-eslint/no-floating-promises.
 */
bootstrap().catch((err: unknown) => {
  const logger = new Logger('BootstrapError');
  logger.error('Error crítico durante el arranque de la aplicación');
  console.error(err);
  process.exit(1);
});
