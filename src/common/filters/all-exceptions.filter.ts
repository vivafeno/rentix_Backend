import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * @class AllExceptionsFilter
 * @description Filtro global de excepciones nativo.
 * Transforma errores técnicos en un contrato atómico para Signals de Angular 21.
 * @version 2026.1.0
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // Inyectamos el adaptador de red (Express/Fastify) de forma agnóstica
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // 1. Determinar el código de estado (Nativo)
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Extraer el mensaje de error de forma segura
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    
    let message = 'Error interno en el servidor Rentix';
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || (exceptionResponse as any).error || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 3. Log de rigor para trazabilidad
    this.logger.error(
      `[ERROR] ${ctx.getRequest().method} ${ctx.getRequest().url} - Status: ${httpStatus} - Message: ${JSON.stringify(message)}`,
    );

    // 4. Contrato de Respuesta (Alineado con el Middleware de éxito)
    // Importante: No lleva 'data', lleva 'message' y 'error' para que el Front sepa que es un fallo.
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: Array.isArray(message) ? message[0] : message, // Siempre devolvemos string plano
      error: exception instanceof Error ? exception.name : 'UnknownError',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}