import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeduplicationService } from './deduplication.service';
import { ClassificationService } from './classification.service';
import { ArticleCluster } from '../articles/article-cluster.entity';
import { Topic } from '../articles/topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleCluster, Topic]),
  ],
  providers: [DeduplicationService, ClassificationService],
  exports: [DeduplicationService, ClassificationService],
})
export class NlpModule {}