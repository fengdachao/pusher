import { Controller, Get, Patch, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { DigestService } from './digest.service';
import { WebPushService } from './webpush.service';

@ApiTags('Notifications')
@Controller('notification-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private digestService: DigestService,
    private webPushService: WebPushService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings(@Request() req) {
    return this.notificationsService.getSettings(req.user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Request() req, @Body() updateDto: UpdateNotificationSettingsDto) {
    return this.notificationsService.updateSettings(req.user.userId, updateDto);
  }

  @Post('digest/trigger')
  @ApiOperation({ summary: 'Trigger manual digest' })
  async triggerDigest(@Request() req, @Body() body: { type?: 'morning' | 'evening' | 'manual' }) {
    const digestType = body.type || 'manual';
    await this.digestService.triggerDigest(req.user.userId, digestType);
    return { message: 'Digest triggered successfully' };
  }

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for web push' })
  getVapidPublicKey() {
    return { 
      publicKey: this.webPushService.getVapidPublicKey(),
    };
  }
}