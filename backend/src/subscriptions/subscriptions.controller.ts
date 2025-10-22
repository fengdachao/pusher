import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ArticlesService } from '../articles/articles.service';
import { RankingService } from '../ranking/ranking.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private articlesService: ArticlesService,
    private rankingService: RankingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async findAll(@Request() req) {
    return this.subscriptionsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async create(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsService.create(req.user.userId, createSubscriptionDto);
    
    // Trigger immediate recommendation refresh in background
    // This doesn't block the response
    this.refreshUserRecommendations(req.user.userId).catch(err => 
      console.error('Failed to refresh recommendations:', err)
    );
    
    return subscription;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findById(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    const subscription = await this.subscriptionsService.update(id, req.user.userId, updateSubscriptionDto);
    
    // Trigger immediate recommendation refresh in background
    this.refreshUserRecommendations(req.user.userId).catch(err => 
      console.error('Failed to refresh recommendations:', err)
    );
    
    return subscription;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async delete(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    await this.subscriptionsService.delete(id, req.user.userId);
  }

  @Get('recommendations/instant')
  @ApiOperation({ summary: 'Get instant personalized recommendations based on subscriptions' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getInstantRecommendations(@Request() req) {
    return this.getPersonalizedFeed(req.user.userId, 20);
  }

  /**
   * Helper method to refresh user recommendations in the background
   */
  private async refreshUserRecommendations(userId: string): Promise<void> {
    // This is called asynchronously after subscription changes
    // It helps pre-warm the cache for personalized recommendations
    await this.getPersonalizedFeed(userId, 20);
  }

  /**
   * Get personalized feed for a user based on their subscriptions
   */
  private async getPersonalizedFeed(userId: string, limit: number = 20) {
    try {
      // Get recent articles (last 7 days for immediate recommendations)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const feedResult = await this.articlesService.getFeed({
        userId,
        sort: 'personal',
        from: sevenDaysAgo,
        limit,
        diversity: true,
      });

      return feedResult;
    } catch (error) {
      console.error('Error getting personalized feed:', error);
      // Return empty feed on error
      return {
        items: [],
        page: 1,
        limit,
        total: 0,
      };
    }
  }
}