import { SourcesService } from './sources.service';
export declare class SourcesController {
    private sourcesService;
    constructor(sourcesService: SourcesService);
    findAll(): Promise<import("./source.entity").Source[]>;
}
