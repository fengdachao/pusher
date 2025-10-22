import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column({ name: 'morning_time', type: 'time', default: '07:30' })
  morningTime: string;

  @Column({ name: 'evening_time', type: 'time', default: '19:30' })
  eveningTime: string;

  @Column({ name: 'channel_email', default: true })
  channelEmail: boolean;

  @Column({ name: 'channel_push', default: true })
  channelPush: boolean;

  @Column({ name: 'channel_webpush', default: true })
  channelWebpush: boolean;

  @Column({ name: 'breaking_enabled', default: true })
  breakingEnabled: boolean;

  @Column({ name: 'max_items_per_digest', default: 20 })
  maxItemsPerDigest: number;

  @Column({ name: 'mute_start', type: 'time', nullable: true })
  muteStart?: string;

  @Column({ name: 'mute_end', type: 'time', nullable: true })
  muteEnd?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, user => user.notificationSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}