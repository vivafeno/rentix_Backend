import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces/jwt-payload.interface';

/**
 * @description Decorador para obtener el objeto de usuario hidratado (Rentix 2026).
 * Resuelve errores de linter (16 y 19) mediante el tipado de la Request de Express.
 * @param {keyof ActiveUserData} data Propiedad específica a extraer del usuario.
 * @returns {ActiveUserData | ActiveUserData[keyof ActiveUserData]} El usuario o la propiedad.
 */
export const User = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // 🛡️ Tipamos la request para que deje de ser 'any'.
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: ActiveUserData }>();

    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException(
        'USER_DECORATOR_ERROR: El usuario no ha sido inyectado en la petición. Verifica que el endpoint esté protegido por un Guard.',
      );
    }

    // Retorno tipado dinámicamente: si hay data devuelve el valor de la clave, si no, el objeto completo.
    return data ? user[data] : user;
  },
);
