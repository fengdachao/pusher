import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum KeywordsOp {
  AND = 'AND',
  OR = 'OR'
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'text', array: true, default: '{}' })
  keywords: string[];

  @Column({ name: 'keywords_op', type: 'enum', enum: KeywordsOp, default: KeywordsOp.OR })
  keywordsOp: KeywordsOp;

  @Column({ name: 'topic_codes', type: 'text', array: true, default: '{}' })
  topicCodes: string[];

  @Column({ name: 'source_codes', type: 'text', array: true, default: '{}' })
  sourceCodes: string[];

  @Column({ name: 'lang_codes', type: 'text', array: true, default: '{}' })
  langCodes: string[];

  @Column({ name: 'region_codes', type: 'text', array: true, default: '{}' })
  regionCodes: string[];

  @Column({ default: 5 })
  priority: number;

  @Column({ name: 'daily_limit', default: 30 })
  dailyLimit: number;

  @Column({ name: 'mute_start', type: 'time', nullable: true })
  muteStart?: string;

  @Column({ name: 'mute_end', type: 'time', nullable: true })
  muteEnd?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}