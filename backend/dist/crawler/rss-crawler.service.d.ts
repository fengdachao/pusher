import { Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Source } from '../sources/source.entity';
export declare class RssCrawlerService {
    private articlesRepository;
    private readonly logger;
    private readonly parser;
    constructor(articlesRepository: Repository<Article>);
    crawlRssSource(source: Source): Promise<number>;
}
