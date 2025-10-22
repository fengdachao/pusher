import { Source } from '../sources/source.entity';
import { Topic } from './topic.entity';
import { ArticleCluster } from './article-cluster.entity';
import { Interaction } from './interaction.entity';
export declare class Article {
    id: string;
    sourceId: string;
    clusterId?: string;
    url: string;
    urlHash: string;
    title: string;
    summary?: string;
    content?: string;
    lang?: string;
    imageUrl?: string;
    publishedAt?: Date;
    fetchedAt: Date;
    popularity: number;
    deleted: boolean;
    source: Source;
    cluster?: ArticleCluster;
    topics: Topic[];
    interactions: Interaction[];
}
