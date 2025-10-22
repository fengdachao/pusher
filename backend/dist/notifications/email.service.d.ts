import { ConfigService } from '@nestjs/config';
export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}
export interface DigestArticle {
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: Date;
    imageUrl?: string;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendDigest(userEmail: string, articles: DigestArticle[], digestType?: 'morning' | 'evening' | 'breaking'): Promise<void>;
    sendBreakingNews(userEmail: string, article: DigestArticle): Promise<void>;
    private generateDigestTemplate;
    private generateBreakingNewsTemplate;
    private formatDate;
    testConnection(): Promise<boolean>;
}
