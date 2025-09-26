import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

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
    return this.subscriptionsService.create(req.user.userId, createSubscriptionDto);
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
    return this.subscriptionsService.update(id, req.user.userId, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async delete(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    await this.subscriptionsService.delete(id, req.user.userId);
  }
}