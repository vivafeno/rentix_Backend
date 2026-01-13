import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeederService } from './config/seeder.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Rentix API')
    .setDescription('Documentación de la API Rentix')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // 👈 nombre del esquema
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // 👈 ¡ESTO ES LA CLAVE! Convierte los tipos automáticamente
    transformOptions: {
      enableImplicitConversion: true, // Opcional, ayuda a veces
    },
  }));

  const seeder = app.get(SeederService);
  await seeder.seed();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
