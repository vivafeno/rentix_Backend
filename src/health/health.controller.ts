import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

/**
 * @class HealthController
 * @description Orquestador de monitorización del sistema.
 * @version 2026.1.18
 */
@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /**
   * @method check
   * @description Liveness probe básica.
   * Eliminado await innecesario para cumplir con @typescript-eslint/await-thenable.
   */
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiOkResponse({ description: 'Simple liveness check' })
  check(): { status: string } {
    return this.health.liveness();
  }

  /**
   * @method db
   * @description Verifica la conectividad con la DB.
   */
  @Get('db')
  @ApiOperation({ summary: 'Database connectivity check' })
  @ApiOkResponse({ description: 'Database status and latency' })
  async db(): Promise<unknown> {
    // Aquí sí usamos await porque pingDb() suele ser asíncrono (I/O de DB)
    return await this.health.pingDb();
  }

  /**
   * @method ready
   * @description Readiness probe.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready(): Promise<{ status: string }> {
    return await this.health.readiness();
  }
}
