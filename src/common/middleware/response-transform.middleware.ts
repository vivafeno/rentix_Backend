import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseTransformMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    // Sobrescribimos para interceptar la respuesta de forma imperativa
    res.send = function (body): any {
      // 1. Rigor: No transformar si es un PDF o binario
      const contentType = res.get('Content-Type');
      if (contentType?.includes('application/pdf') || req.url.includes('/pdf')) {
        return originalSend.call(this, body);
      }

      // 2. Intentar recuperar la data
      let parsedBody;
      try {
        parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (e) {
        parsedBody = body;
      }

      // 3. Estándar Rentix 2026 (Para Signals en Angular 21)
      const result = {
        data: parsedBody,
        meta: {
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          method: req.method
        }
      };

      // 4. Devolver como string
      return originalSend.call(this, JSON.stringify(result));
    };

    next();
  }
}