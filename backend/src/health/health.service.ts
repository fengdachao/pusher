import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(private health: HealthCheckService) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
