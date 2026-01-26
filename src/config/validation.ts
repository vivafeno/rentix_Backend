import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsNotEmpty, validateSync, MinLength } from 'class-validator';

/**
 * @enum Environment
 * @description Ambientes de ejecución soportados por la plataforma Rentix.
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

/**
 * @class EnvironmentVariables
 * @description Esquema de validación para las variables de entorno (.env).
 * Define el blindaje de la infraestructura y los requisitos mínimos de seguridad.
 * * Rigor 2026: Se usa el operador '!' para indicar que las variables serán 
 * inyectadas por el validador antes del arranque del sistema.
 */
class EnvironmentVariables {
  @IsEnum(Environment, { message: 'NODE_ENV debe ser: development, production o test.' })
  NODE_ENV!: Environment;

  @IsNumber({}, { message: 'PORT debe ser un número.' })
  PORT: number = 3000;

  /* ─────────────────────────────────────────────────────────────────
   * 🗄️ DATABASE CONFIGURATION (Core Persistence)
   * ───────────────────────────────────────────────────────────────── */

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_HOST es obligatorio para la conexión.' })
  DATABASE_HOST!: string;

  @IsNumber()
  DATABASE_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER!: string;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_PASS no puede estar vacío por seguridad.' })
  DATABASE_PASS!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME!: string;

  /* ─────────────────────────────────────────────────────────────────
   * 🔐 SECURITY & IDENTITY (Cryptography)
   * ───────────────────────────────────────────────────────────────── */

  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET debe tener un rigor mínimo de 32 caracteres.' })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET debe tener un rigor mínimo de 32 caracteres.' })
  JWT_REFRESH_SECRET!: string;
}

/**
 * @function validate
 * @description Validador atómico de configuración. 
 * Bloquea el arranque del servidor si la infraestructura no es segura.
 * * @param config Record de variables de entorno cargadas desde el .env
 * @returns Instancia validada y tipada de EnvironmentVariables
 * @throws Error crítico de configuración con desglose de fallos
 */
export function validate(config: Record<string, unknown>) {
  // Transformación con conversión implícita (Strings de env -> Numbers de clase)
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  // Validación síncrona estricta
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(err => 
      `   - [${err.property}]: ${Object.values(err.constraints || {}).join(', ')}`
    );

    // Formateo visual para logs de DevOps
    throw new Error(
      `\n❌ [RENTIX 2026 - CONFIG ERROR]\n` +
      `Se han detectado fallos en la configuración de infraestructura:\n` +
      `${errorMessages.join('\n')}\n` +
      `Revise su archivo .env o las variables de entorno del sistema.\n`
    );
  }

  return validatedConfig;
}