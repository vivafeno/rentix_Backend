import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'Simple liveness check' })
  async check() {
    return this.health.liveness();
  }

  @Get('db')
  @ApiOkResponse({ description: 'Database connectivity check' })
  async db() {
    return this.health.pingDb();
  }

  @Get('ready')
  @ApiOkResponse({ description: 'Readiness check (aggregates required deps)' })
  async ready() {
    return this.health.readiness();
  }
}
