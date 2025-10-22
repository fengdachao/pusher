import { Repository } from 'typeorm';
import { Source } from './source.entity';
export declare class SourcesService {
    private sourcesRepository;
    constructor(sourcesRepository: Repository<Source>);
    findAll(): Promise<Source[]>;
    findByCode(code: string): Promise<Source | null>;
    findById(id: string): Promise<Source | null>;
    create(sourceData: Partial<Source>): Promise<Source>;
}
