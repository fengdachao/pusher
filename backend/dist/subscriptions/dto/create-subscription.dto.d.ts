import { KeywordsOp } from '../subscription.entity';
export declare class CreateSubscriptionDto {
    name: string;
    keywords?: string[];
    keywordsOp?: KeywordsOp;
    topicCodes?: string[];
    sourceCodes?: string[];
    langCodes?: string[];
    regionCodes?: string[];
    priority?: number;
    dailyLimit?: number;
    muteStart?: string;
    muteEnd?: string;
}
