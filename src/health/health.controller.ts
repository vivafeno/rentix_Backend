import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'Simple liveness check',
    schema: {
      type: 'object',
      example: { status: 'ok' },
    },
  })
  async check() {
    return this.health.liveness();
  }

  @Get('db')
  @ApiOkResponse({
    description: 'Database connectivity check',
    schema: {
      type: 'object',
      example: { database: 'up' },
    },
  })
  async db() {
    return this.health.pingDb();
  }

  @Get('ready')
  @ApiOkResponse({
    description: 'Readiness check (aggregates required deps)',
    schema: {
      type: 'object',
      example: { status: 'ready' },
    },
  })
  async ready() {
    return this.health.readiness();
  }
}
