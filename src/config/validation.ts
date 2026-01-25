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
 */
class EnvironmentVariables {
  @IsEnum(Environment, { message: 'NODE_ENV debe ser: development, production o test.' })
  NODE_ENV: Environment;

  @IsNumber({}, { message: 'PORT debe ser un número.' })
  PORT: number = 3000;

  /* --- 🗄️ DATABASE CONFIGURATION --- */

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_HOST es obligatorio para la conexión.' })
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_PASS no puede estar vacío por seguridad.' })
  DATABASE_PASS: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  /* --- 🔐 SECURITY & IDENTITY --- */

  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET debe tener un rigor mínimo de 32 caracteres.' })
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET debe tener un rigor mínimo de 32 caracteres.' })
  JWT_REFRESH_SECRET: string;
}

/**
 * @function validate
 * @description Validador atómico de configuración. 
 * Se ejecuta antes de la instanciación de cualquier módulo para prevenir estados de error en runtime.
 * @param config Record de variables de entorno cargadas.
 * @returns Objeto de configuración validado y tipado.
 * @throws Error si alguna variable crítica falta o es inválida.
 */
export function validate(config: Record<string, unknown>) {
  // Transforma el objeto plano del .env a una instancia de la clase EnvironmentVariables
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // Crucial: convierte strings del .env a tipos Number/Boolean
  });

  // Ejecuta la validación síncrona de class-validator
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // Rigor 2026: No se permiten omisiones
  });

  if (errors.length > 0) {
    // Formateo de errores para lectura rápida en logs de despliegue
    const errorMessages = errors.map(err => 
      `   - [${err.property}]: ${Object.values(err.constraints || {}).join(', ')}`
    );

    throw new Error(
      `\n❌ [RENTIX CONFIG ERROR] Fallo en la validación de infraestructura:\n${errorMessages.join('\n')}\n`
    );
  }

  return validatedConfig;
}