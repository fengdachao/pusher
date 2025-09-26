import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { PersonalizationService } from './personalization.service';
import { User } from '../users/user.entity';
import { Article } from '../articles/article.entity';
import { Interaction } from '../articles/interaction.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Article, Interaction, Subscription]),
  ],
  providers: [RankingService, PersonalizationService],
  exports: [RankingService, PersonalizationService],
})
export class RankingModule {}