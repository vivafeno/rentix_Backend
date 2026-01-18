import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

/**
 * @description Decorador para extraer propiedades del usuario autenticado (Blueprint 2026).
 * @param data Propiedad específica (id, email, appRole, etc.)
 * @usage @GetUser('appRole')
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException('GetUser: El Guard de Auth no ha inyectado el usuario en la Request.');
    }

    // Si pedimos una propiedad que no existe, devolvemos undefined (el servicio lo manejará)
    return data ? user?.[data] : user;
  },
);