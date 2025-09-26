import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { InteractionType } from './interaction.entity';

@ApiTags('Articles')
@Controller()
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized news feed' })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['recency', 'trend', 'personal'] })
  @ApiQuery({ name: 'topic', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getFeed(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('sort') sort?: 'recency' | 'trend' | 'personal',
    @Query('topic') topic?: string,
    @Query('source') source?: string,
    @Query('lang') lang?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.articlesService.getFeed({
      page,
      limit,
      sort,
      topic,
      source,
      lang,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article details' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findById(id);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get all available topics' })
  @ApiResponse({ status: 200, description: 'Topics retrieved successfully' })
  async getTopics() {
    return this.articlesService.getTopics();
  }

  @Post('interactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record user interaction with article' })
  @ApiResponse({ status: 201, description: 'Interaction recorded successfully' })
  async recordInteraction(
    @Request() req,
    @Body() body: {
      articleId: string;
      type: InteractionType;
      metadata?: { readTimeSec?: number; channel?: string };
    }
  ) {
    await this.articlesService.recordInteraction(
      req.user.userId,
      body.articleId,
      body.type,
      body.metadata
    );
    return { success: true };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search articles' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('topic') topic?: string,
    @Query('source') source?: string,
    @Query('lang') lang?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.articlesService.search(query, {
      page,
      limit,
      topic,
      source,
      lang,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}