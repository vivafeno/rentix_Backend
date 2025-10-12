import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si pasamos un campo: @GetUser('sub') → devuelve user.sub
    // Si no pasamos nada: @GetUser() → devuelve el objeto completo
    return data ? user?.[data] : user;
  },
);
