import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDeviceDto } from './dto/create-device.dto';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post('me/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new device for push notifications' })
  @ApiResponse({ status: 201, description: 'Device added successfully' })
  async addDevice(@Request() req, @Body() createDeviceDto: CreateDeviceDto) {
    return this.usersService.addDevice(req.user.userId, createDeviceDto);
  }

  @Delete('me/devices/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a device' })
  @ApiResponse({ status: 204, description: 'Device removed successfully' })
  async removeDevice(@Request() req, @Param('deviceId') deviceId: string) {
    await this.usersService.removeDevice(req.user.userId, deviceId);
  }

  @Get('me/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user devices' })
  @ApiResponse({ status: 200, description: 'User devices retrieved successfully' })
  async getDevices(@Request() req) {
    return this.usersService.getUserDevices(req.user.userId);
  }
}