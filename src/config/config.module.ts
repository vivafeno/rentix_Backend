import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './validation';

/**
 * @class ConfigModule
 * @description Módulo de Infraestructura de Configuración.
 * Centraliza la carga, validación y provisión global de variables de entorno.
 * Implementa el "Fail-Fast" de Rentix 2026: la app no levanta si el .env es inválido.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      /**
       * 🚩 Rigor: Hace que ConfigService sea inyectable en cualquier parte 
       * de la aplicación sin necesidad de re-importar este módulo.
       */
      isGlobal: true,

      /**
       * 🚩 Rigor: Inyecta el mapa de configuración tipado y sanitizado.
       */
      load: [configuration],

      /**
       * 🚩 Rigor: Ejecuta el esquema de validación de class-validator.
       */
      validate,
      
      /**
       * 🚩 Opcional: Cachea los valores en memoria para mejorar el rendimiento 
       * en aplicaciones de alta concurrencia.
       */
      cache: true,
    }),
  ],
})
export class ConfigModule {}