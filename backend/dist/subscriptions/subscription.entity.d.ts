import { User } from '../users/user.entity';
export declare enum KeywordsOp {
    AND = "AND",
    OR = "OR"
}
export declare class Subscription {
    id: string;
    userId: string;
    name: string;
    keywords: string[];
    keywordsOp: KeywordsOp;
    topicCodes: string[];
    sourceCodes: string[];
    langCodes: string[];
    regionCodes: string[];
    priority: number;
    dailyLimit: number;
    muteStart?: string;
    muteEnd?: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
