import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Device } from './device.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { Interaction } from '../articles/interaction.entity';
import { NotificationSettings } from '../notifications/notification-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true, length: 100 })
  name?: string;

  @Column({ default: 'zh', length: 8 })
  lang: string;

  @Column({ nullable: true, length: 8 })
  region?: string;

  @Column({ default: 'Asia/Shanghai', length: 64 })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Device, device => device.user)
  devices: Device[];

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Interaction, interaction => interaction.user)
  interactions: Interaction[];

  @OneToOne(() => NotificationSettings, settings => settings.user)
  notificationSettings: NotificationSettings;
}