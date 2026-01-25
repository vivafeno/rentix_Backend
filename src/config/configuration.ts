import { registerAs } from '@nestjs/config';

/**
 * @namespace AppConfig
 * @description Mapeo tipado de la infraestructura Rentix 2026.
 * Este archivo centraliza el acceso a variables de entorno inyectando coherencia 
 * en los tiempos de vida de tokens y políticas de seguridad.
 */
export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  /* --- 🗄️ PERSISTENCE LAYER --- */
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER,
    pass: process.env.DATABASE_PASS,
    name: process.env.DATABASE_NAME,
  },

  /* --- 🔐 IDENTITY & SECURITY --- */
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    // Rigor 2026: TTLs estrictos para minimizar ventana de exposición
    accessTtl: process.env.JWT_ACCESS_TTL || '15m', 
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },

  /* --- 🌐 NETWORK & ACCESS --- */
  cors: {
    // Sanitización de orígenes permitidos para prevenir CSRF
    origins: (process.env.CORS_ORIGINS || '*')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  },
});