import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SourcesService } from './sources.service';

@ApiTags('Sources')
@Controller('sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available news sources' })
  @ApiResponse({ status: 200, description: 'Sources retrieved successfully' })
  async findAll() {
    return this.sourcesService.findAll();
  }
}