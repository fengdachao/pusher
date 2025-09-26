import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum DevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: DevicePlatform })
  platform: DevicePlatform;

  @Column({ name: 'push_token', nullable: true })
  pushToken?: string;

  @Column({ name: 'webpush_endpoint', nullable: true })
  webpushEndpoint?: string;

  @Column({ name: 'webpush_p256dh', nullable: true })
  webpushP256dh?: string;

  @Column({ name: 'webpush_auth', nullable: true })
  webpushAuth?: string;

  @Column({ name: 'last_active_at', nullable: true })
  lastActiveAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}