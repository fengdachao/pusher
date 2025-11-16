import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { Source } from '../sources/source.entity';
import { Article } from '../articles/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Source, Article]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
