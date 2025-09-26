import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  code: string;

  @Column({ length: 64 })
  name: string;

  @Column({ default: 0 })
  weight: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToMany(() => Article, article => article.topics)
  articles: Article[];
}