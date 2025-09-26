import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Source } from '../sources/source.entity';
import { Topic } from './topic.entity';
import { ArticleCluster } from './article-cluster.entity';
import { Interaction } from './interaction.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_id' })
  sourceId: string;

  @Column({ name: 'cluster_id', nullable: true })
  clusterId?: string;

  @Column()
  url: string;

  @Column({ name: 'url_hash', length: 40 })
  urlHash: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true, length: 8 })
  lang?: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'fetched_at' })
  fetchedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  popularity: number;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => Source, source => source.articles)
  @JoinColumn({ name: 'source_id' })
  source: Source;

  @ManyToOne(() => ArticleCluster, cluster => cluster.articles)
  @JoinColumn({ name: 'cluster_id' })
  cluster?: ArticleCluster;

  @ManyToMany(() => Topic, topic => topic.articles)
  @JoinTable({
    name: 'article_topics',
    joinColumn: { name: 'article_id' },
    inverseJoinColumn: { name: 'topic_id' }
  })
  topics: Topic[];

  @OneToMany(() => Interaction, interaction => interaction.article)
  interactions: Interaction[];
}