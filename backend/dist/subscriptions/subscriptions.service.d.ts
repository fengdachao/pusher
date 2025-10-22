import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionsService {
    private subscriptionsRepository;
    constructor(subscriptionsRepository: Repository<Subscription>);
    findAll(userId: string): Promise<{
        items: Subscription[];
        page: number;
        limit: number;
        total: number;
    }>;
    findById(id: string, userId: string): Promise<Subscription | null>;
    create(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    update(id: string, userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription>;
    delete(id: string, userId: string): Promise<void>;
    findByUserId(userId: string): Promise<Subscription[]>;
}
