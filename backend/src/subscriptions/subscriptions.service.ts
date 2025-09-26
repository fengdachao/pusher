import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async findAll(userId: string) {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { userId },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });

    return {
      items: subscriptions,
      page: 1,
      limit: subscriptions.length,
      total: subscriptions.length,
    };
  }

  async findById(id: string, userId: string): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({
      where: { id, userId },
    });
  }

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionsRepository.create({
      ...createSubscriptionDto,
      userId,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async update(id: string, userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findById(id, userId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionsRepository.save(subscription);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.subscriptionsRepository.delete({
      id,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Subscription not found');
    }
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { userId },
      order: { priority: 'DESC' },
    });
  }
}