import { DataSource } from 'typeorm';
import { Source, SourceType } from '../../sources/source.entity';
import { Topic } from '../../articles/topic.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'news_subscription',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();

  // Seed sources
  const sourceRepository = dataSource.getRepository(Source);
  
  const sources = [
    {
      code: 'techcrunch',
      name: 'TechCrunch',
      type: SourceType.RSS,
      homepageUrl: 'https://techcrunch.com',
      feedUrl: 'https://techcrunch.com/feed/',
      lang: 'en',
      region: 'US',
    },
    {
      code: 'theverge',
      name: 'The Verge',
      type: SourceType.RSS,
      homepageUrl: 'https://www.theverge.com',
      feedUrl: 'https://www.theverge.com/rss/index.xml',
      lang: 'en',
      region: 'US',
    },
    {
      code: '36kr',
      name: '36氪',
      type: SourceType.RSS,
      homepageUrl: 'https://36kr.com',
      feedUrl: 'https://36kr.com/feed',
      lang: 'zh',
      region: 'CN',
    },
    {
      code: 'ithome',
      name: 'IT之家',
      type: SourceType.RSS,
      homepageUrl: 'https://www.ithome.com',
      feedUrl: 'https://www.ithome.com/rss/',
      lang: 'zh',
      region: 'CN',
    },
  ];

  for (const sourceData of sources) {
    const existingSource = await sourceRepository.findOne({ where: { code: sourceData.code } });
    if (!existingSource) {
      const source = sourceRepository.create(sourceData);
      await sourceRepository.save(source);
      console.log(`Created source: ${sourceData.name}`);
    }
  }

  // Seed topics
  const topicRepository = dataSource.getRepository(Topic);
  
  const topics = [
    { code: 'tech', name: '科技', weight: 10 },
    { code: 'business', name: '商业', weight: 8 },
    { code: 'ai', name: '人工智能', weight: 9 },
    { code: 'startup', name: '创业', weight: 7 },
    { code: 'finance', name: '金融', weight: 6 },
    { code: 'mobile', name: '移动互联网', weight: 8 },
    { code: 'gaming', name: '游戏', weight: 5 },
    { code: 'crypto', name: '加密货币', weight: 6 },
    { code: 'science', name: '科学', weight: 7 },
    { code: 'health', name: '健康', weight: 6 },
  ];

  for (const topicData of topics) {
    const existingTopic = await topicRepository.findOne({ where: { code: topicData.code } });
    if (!existingTopic) {
      const topic = topicRepository.create(topicData);
      await topicRepository.save(topic);
      console.log(`Created topic: ${topicData.name}`);
    }
  }

  await dataSource.destroy();
  console.log('Seeding completed!');
}

seed().catch(console.error);