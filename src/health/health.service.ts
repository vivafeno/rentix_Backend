import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async pingDb() {
    const start = performance.now();
    const qr = this.dataSource.createQueryRunner();
    try {
      await qr.query('SELECT 1');
      const latencyMs = Number((performance.now() - start).toFixed(1));
      return { status: 'ok', latencyMs };
    } catch (err) {
      return { status: 'down', error: (err as Error).message ?? 'unknown' };
    } finally {
      await qr.release();
    }
  }

  async readiness() {
    const db = await this.pingDb();
    const ready = db.status === 'ok';
    return {
      status: ready ? 'ready' : 'not-ready',
      checks: {
        db,
      },
      timestamp: new Date().toISOString(),
    };
  }

  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
