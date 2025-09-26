import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Article } from './article.entity';

export enum InteractionType {
  CLICK = 'click',
  LIKE = 'like',
  DISLIKE = 'dislike',
  READ = 'read',
  SHARE = 'share',
  OPEN_PUSH = 'open_push'
}

@Entity('interactions')
export class Interaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ type: 'enum', enum: InteractionType })
  type: InteractionType;

  @Column({ name: 'read_time_sec', nullable: true })
  readTimeSec?: number;

  @Column({ nullable: true, length: 16 })
  channel?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.interactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Article, article => article.interactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;
}