import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@ApiTags('Notifications')
@Controller('notification-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

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
}