import { Repository } from 'typeorm';
import { Source } from '../sources/source.entity';
import { RssCrawlerService } from './rss-crawler.service';
export declare class CrawlerService {
    private sourcesRepository;
    private rssCrawlerService;
    private readonly logger;
    constructor(sourcesRepository: Repository<Source>, rssCrawlerService: RssCrawlerService);
    crawlAllSources(): Promise<void>;
    crawlSource(sourceCode: string): Promise<number>;
}
