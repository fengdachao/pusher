import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  async getStats() {
    return this.monitoringService.getSystemStats();
  }

  @Get('database-stats')
  @ApiOperation({ summary: 'Get database statistics' })
  @ApiResponse({ status: 200, description: 'Database statistics retrieved successfully' })
  async getDatabaseStats() {
    return this.monitoringService.getDatabaseStats();
  }

  @Get('crawler-stats')
  @ApiOperation({ summary: 'Get crawler statistics' })
  @ApiResponse({ status: 200, description: 'Crawler statistics retrieved successfully' })
  async getCrawlerStats() {
    return this.monitoringService.getCrawlerStats();
  }

  @Get('user-stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats() {
    return this.monitoringService.getUserStats();
  }
}
