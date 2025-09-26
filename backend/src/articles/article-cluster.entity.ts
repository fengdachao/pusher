import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_clusters')
export class ArticleCluster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', nullable: true })
  simhash?: string;

  @Column({ name: 'representative_article_id', nullable: true })
  representativeArticleId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Article, article => article.cluster)
  articles: Article[];
}