import { IsString, IsArray, IsEnum, IsInt, IsOptional, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KeywordsOp } from '../subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '科技热点' })
  @IsString()
  name: string;

  @ApiProperty({ example: ['AI', '芯片'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({ enum: KeywordsOp, required: false })
  @IsOptional()
  @IsEnum(KeywordsOp)
  keywordsOp?: KeywordsOp;

  @ApiProperty({ example: ['tech', 'business'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicCodes?: string[];

  @ApiProperty({ example: ['theverge', '36kr'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceCodes?: string[];

  @ApiProperty({ example: ['zh', 'en'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  langCodes?: string[];

  @ApiProperty({ example: ['CN', 'US'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionCodes?: string[];

  @ApiProperty({ example: 5, minimum: 1, maximum: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @ApiProperty({ example: 30, minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  dailyLimit?: number;

  @ApiProperty({ example: '22:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  muteStart?: string;

  @ApiProperty({ example: '07:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  muteEnd?: string;
}