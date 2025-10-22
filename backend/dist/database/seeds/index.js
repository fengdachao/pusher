"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const source_entity_1 = require("../../sources/source.entity");
const topic_entity_1 = require("../../articles/topic.entity");
const user_entity_1 = require("../../users/user.entity");
const notification_settings_entity_1 = require("../../notifications/notification-settings.entity");
const bcrypt = require("bcryptjs");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'news_subscription',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
    });
    await dataSource.initialize();
    console.log('Connected to database for seeding...');
    const sourceRepository = dataSource.getRepository(source_entity_1.Source);
    const sources = [
        {
            code: 'techcrunch',
            name: 'TechCrunch',
            type: source_entity_1.SourceType.RSS,
            homepageUrl: 'https://techcrunch.com',
            feedUrl: 'https://techcrunch.com/feed/',
            lang: 'en',
            region: 'US',
            enabled: true,
            fetchIntervalSec: 600,
            healthStatus: 'healthy',
        },
        {
            code: 'theverge',
            name: 'The Verge',
            type: source_entity_1.SourceType.RSS,
            homepageUrl: 'https://www.theverge.com',
            feedUrl: 'https://www.theverge.com/rss/index.xml',
            lang: 'en',
            region: 'US',
            enabled: true,
            fetchIntervalSec: 600,
            healthStatus: 'healthy',
        },
        {
            code: '36kr',
            name: '36氪',
            type: source_entity_1.SourceType.RSS,
            homepageUrl: 'https://36kr.com',
            feedUrl: 'https://36kr.com/feed',
            lang: 'zh',
            region: 'CN',
            enabled: true,
            fetchIntervalSec: 600,
            healthStatus: 'healthy',
        },
        {
            code: 'ithome',
            name: 'IT之家',
            type: source_entity_1.SourceType.RSS,
            homepageUrl: 'https://www.ithome.com',
            feedUrl: 'https://www.ithome.com/rss/',
            lang: 'zh',
            region: 'CN',
            enabled: true,
            fetchIntervalSec: 600,
            healthStatus: 'healthy',
        },
        {
            code: 'bbc-tech',
            name: 'BBC Technology',
            type: source_entity_1.SourceType.RSS,
            homepageUrl: 'https://www.bbc.com/news/technology',
            feedUrl: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
            lang: 'en',
            region: 'UK',
            enabled: true,
            fetchIntervalSec: 900,
            healthStatus: 'healthy',
        },
    ];
    for (const sourceData of sources) {
        const existingSource = await sourceRepository.findOne({ where: { code: sourceData.code } });
        if (!existingSource) {
            const source = sourceRepository.create(sourceData);
            await sourceRepository.save(source);
            console.log(`✅ Created source: ${sourceData.name}`);
        }
        else {
            console.log(`⏭️  Source already exists: ${sourceData.name}`);
        }
    }
    const topicRepository = dataSource.getRepository(topic_entity_1.Topic);
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
        { code: 'politics', name: '政治', weight: 4 },
        { code: 'entertainment', name: '娱乐', weight: 4 },
        { code: 'education', name: '教育', weight: 5 },
        { code: 'sports', name: '体育', weight: 4 },
    ];
    for (const topicData of topics) {
        const existingTopic = await topicRepository.findOne({ where: { code: topicData.code } });
        if (!existingTopic) {
            const topic = topicRepository.create(topicData);
            await topicRepository.save(topic);
            console.log(`✅ Created topic: ${topicData.name}`);
        }
        else {
            console.log(`⏭️  Topic already exists: ${topicData.name}`);
        }
    }
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const notificationRepository = dataSource.getRepository(notification_settings_entity_1.NotificationSettings);
    const existingUser = await userRepository.findOne({ where: { email: 'demo@example.com' } });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('demo123', 10);
        const demoUser = userRepository.create({
            email: 'demo@example.com',
            passwordHash: hashedPassword,
            name: '演示用户',
            lang: 'zh',
            region: 'CN',
            timezone: 'Asia/Shanghai',
        });
        const savedUser = await userRepository.save(demoUser);
        const notificationSettings = notificationRepository.create({
            userId: savedUser.id,
            morningTime: '07:30',
            eveningTime: '19:30',
            channelEmail: true,
            channelPush: true,
            channelWebpush: true,
            breakingEnabled: true,
            maxItemsPerDigest: 20,
        });
        await notificationRepository.save(notificationSettings);
        console.log('✅ Created demo user: demo@example.com / demo123');
    }
    else {
        console.log('⏭️  Demo user already exists: demo@example.com');
    }
    await dataSource.destroy();
    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Summary: ${sources.length} sources, ${topics.length} topics, 1 demo user`);
}
seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map