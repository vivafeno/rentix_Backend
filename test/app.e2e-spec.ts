import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import type { App } from 'supertest/types';

/**
 * @description Test de integración End-to-End.
 * Resuelve el error de firma "This expression is not callable".
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * @test / (GET)
   * @description Valida el punto de entrada principal.
   */
  it('/ (GET)', () => {
    // 🛡️ Solución: Accedemos a la propiedad por defecto del módulo o usamos casting
    // Dependiendo de tu config de TS, a veces funciona mejor llamar a request.default
    const server = app.getHttpServer() as App;

    return (
      request as unknown as (app: App) => request.SuperTest<request.Test>
    )(server)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
