import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();
const isDev = configService.get<string>('NODE_ENV') === 'development';
const databaseUrl = configService.get<string>('DATABASE_URL');

const baseOptions = {
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: isDev,
};

const dataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ...baseOptions,
    })
  : new DataSource({
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: Number(configService.get<string>('DB_PORT', '5432')),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'password'),
      database: configService.get<string>('DB_DATABASE', 'news_subscription'),
      ...baseOptions,
    });

export default dataSource;