import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces/jwt-payload.interface';

/**
 * @description Decorador para extraer propiedades del usuario autenticado (Blueprint 2026).
 * Resuelve errores de asignación insegura mediante el tipado de la Request de Express.
 * @param {keyof ActiveUserData} data Propiedad específica a extraer del payload.
 * @returns {ActiveUserData | ActiveUserData[keyof ActiveUserData]} El usuario completo o una propiedad.
 */
export const GetUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // 🛡️ Tipamos la request para evitar que sea 'any'.
    // Usamos intersección para asegurar que 'user' existe en este contexto.
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: ActiveUserData }>();

    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException(
        'AUTH_ERROR: El usuario no está presente en la petición. Asegúrate de usar @Auth() o el Guard correspondiente.',
      );
    }

    // Retorno tipado dinámicamente según 'data'
    return data ? user[data] : user;
  },
);
