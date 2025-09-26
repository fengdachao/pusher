import { IsEnum, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '../device.entity';

class WebPushSubscription {
  @IsString()
  endpoint: string;

  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

export class CreateDeviceDto {
  @ApiProperty({ enum: DevicePlatform })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebPushSubscription)
  webPush?: WebPushSubscription;
}