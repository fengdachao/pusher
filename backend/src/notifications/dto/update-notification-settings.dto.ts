import { IsString, IsBoolean, IsInt, IsOptional, Matches, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ example: '07:30', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  morningTime?: string;

  @ApiProperty({ example: '19:30', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  eveningTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  channelEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  channelPush?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  channelWebpush?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  breakingEnabled?: boolean;

  @ApiProperty({ example: 20, minimum: 1, maximum: 50, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxItemsPerDigest?: number;
}