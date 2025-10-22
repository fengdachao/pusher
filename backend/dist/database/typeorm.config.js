"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
const isDev = configService.get('NODE_ENV') === 'development';
const databaseUrl = configService.get('DATABASE_URL');
const baseOptions = {
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: isDev,
};
const dataSource = databaseUrl
    ? new typeorm_1.DataSource({
        type: 'postgres',
        url: databaseUrl,
        ...baseOptions,
    })
    : new typeorm_1.DataSource({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'news_subscription'),
        ...baseOptions,
    });
exports.default = dataSource;
//# sourceMappingURL=typeorm.config.js.map