import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrawlerService } from './crawler.service';

@ApiTags('Crawler')
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('trigger')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger crawling for all sources' })
  @ApiResponse({ status: 200, description: 'Crawler triggered successfully' })
  async triggerCrawl() {
    // Run in background to avoid blocking the response
    this.crawlerService.crawlAllSources().catch(err => 
      console.error('Error during manual crawl:', err)
    );
    
    return {
      message: 'Crawler triggered successfully. Crawling in background.',
      status: 'started'
    };
  }

  @Post('trigger/:sourceCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger crawling for a specific source' })
  @ApiResponse({ status: 200, description: 'Source crawler triggered successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async triggerSourceCrawl(@Param('sourceCode') sourceCode: string) {
    try {
      const newArticlesCount = await this.crawlerService.crawlSource(sourceCode);
      return {
        message: `Crawled ${newArticlesCount} new articles from ${sourceCode}`,
        sourceCode,
        newArticlesCount
      };
    } catch (error) {
      return {
        message: error.message,
        sourceCode,
        error: true
      };
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get crawler status' })
  @ApiResponse({ status: 200, description: 'Crawler status retrieved successfully' })
  async getCrawlerStatus() {
    return {
      status: 'running',
      schedule: 'Every 10 minutes',
      message: 'Crawler is scheduled to run automatically'
    };
  }

  @Post('trigger/sources')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger crawling for multiple sources' })
  @ApiResponse({ status: 200, description: 'Sources crawler triggered successfully' })
  async triggerMultipleSourcesCrawl(@Param('sourceCodes') sourceCodes: string[]) {
    const results = [];
    
    for (const sourceCode of sourceCodes) {
      try {
        const newArticlesCount = await this.crawlerService.crawlSource(sourceCode);
        results.push({
          sourceCode,
          success: true,
          newArticlesCount
        });
      } catch (error) {
        results.push({
          sourceCode,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      message: 'Crawling completed',
      results
    };
  }
}

