import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Article } from '../articles/article.entity';

export enum SourceType {
  RSS = 'rss',
  API = 'api',
  LIST = 'list'
}

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  code: string;

  @Column({ length: 128 })
  name: string;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @Column({ name: 'homepage_url', nullable: true })
  homepageUrl?: string;

  @Column({ name: 'feed_url', nullable: true })
  feedUrl?: string;

  @Column({ nullable: true, length: 8 })
  lang?: string;

  @Column({ nullable: true, length: 8 })
  region?: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'fetch_interval_sec', default: 600 })
  fetchIntervalSec: number;

  @Column({ name: 'health_status', default: 'healthy', length: 32 })
  healthStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Article, article => article.source)
  articles: Article[];
}