import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Topic } from './topic.entity';
import { ArticleCluster } from './article-cluster.entity';
import { Interaction } from './interaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Topic, ArticleCluster, Interaction])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}