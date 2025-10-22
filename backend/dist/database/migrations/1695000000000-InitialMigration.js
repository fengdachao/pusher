"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1695000000000 = void 0;
class InitialMigration1695000000000 {
    constructor() {
        this.name = 'InitialMigration1695000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" citext NOT NULL,
        "password_hash" character varying NOT NULL,
        "name" character varying(100),
        "lang" character varying(8) DEFAULT 'zh',
        "region" character varying(8),
        "timezone" character varying(64) DEFAULT 'Asia/Shanghai',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "platform" character varying(16) NOT NULL CHECK (platform IN ('ios','android','web')),
        "push_token" text,
        "webpush_endpoint" text,
        "webpush_p256dh" text,
        "webpush_auth" text,
        "last_active_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_devices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_devices_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "sources" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(64) NOT NULL,
        "name" character varying(128) NOT NULL,
        "type" character varying(16) NOT NULL CHECK (type IN ('rss','api','list')),
        "homepage_url" text,
        "feed_url" text,
        "lang" character varying(8),
        "region" character varying(8),
        "enabled" boolean DEFAULT true,
        "fetch_interval_sec" integer DEFAULT 600,
        "health_status" character varying(32) DEFAULT 'healthy',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "UQ_sources_code" UNIQUE ("code"),
        CONSTRAINT "PK_sources" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "article_clusters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "simhash" bigint,
        "representative_article_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_article_clusters" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "source_id" uuid NOT NULL,
        "cluster_id" uuid,
        "url" text NOT NULL,
        "url_hash" character(40) NOT NULL,
        "title" text NOT NULL,
        "summary" text,
        "content" text,
        "lang" character varying(8),
        "image_url" text,
        "published_at" TIMESTAMP WITH TIME ZONE,
        "fetched_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "popularity" numeric(5,4) DEFAULT 0,
        "deleted" boolean DEFAULT false,
        CONSTRAINT "UQ_articles_urlhash" UNIQUE ("url_hash"),
        CONSTRAINT "PK_articles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_articles_source" FOREIGN KEY ("source_id") REFERENCES "sources"("id"),
        CONSTRAINT "FK_articles_cluster" FOREIGN KEY ("cluster_id") REFERENCES "article_clusters"("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "topics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(64) NOT NULL,
        "name" character varying(64) NOT NULL,
        "weight" integer DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "UQ_topics_code" UNIQUE ("code"),
        CONSTRAINT "PK_topics" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "article_topics" (
        "article_id" uuid NOT NULL,
        "topic_id" uuid NOT NULL,
        "score" numeric(5,4) DEFAULT 0,
        CONSTRAINT "PK_article_topics" PRIMARY KEY ("article_id", "topic_id"),
        CONSTRAINT "FK_article_topics_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_article_topics_topic" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(64) NOT NULL,
        "keywords" text[] DEFAULT '{}',
        "keywords_op" character varying(3) DEFAULT 'OR' CHECK (keywords_op IN ('AND','OR')),
        "topic_codes" text[] DEFAULT '{}',
        "source_codes" text[] DEFAULT '{}',
        "lang_codes" text[] DEFAULT '{}',
        "region_codes" text[] DEFAULT '{}',
        "priority" integer DEFAULT 5,
        "daily_limit" integer DEFAULT 30,
        "mute_start" time,
        "mute_end" time,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "interactions" (
        "id" bigserial NOT NULL,
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "type" character varying(16) NOT NULL CHECK (type IN ('click','like','dislike','read','share','open_push')),
        "read_time_sec" integer,
        "channel" character varying(16),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_interactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_interactions_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "bookmarks" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_bookmarks" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "FK_bookmarks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookmarks_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "read_status" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "read_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_read_status" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "FK_read_status_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_read_status_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "notification_settings" (
        "user_id" uuid NOT NULL,
        "morning_time" time DEFAULT '07:30',
        "evening_time" time DEFAULT '19:30',
        "channel_email" boolean DEFAULT true,
        "channel_push" boolean DEFAULT true,
        "channel_webpush" boolean DEFAULT true,
        "breaking_enabled" boolean DEFAULT true,
        "max_items_per_digest" integer DEFAULT 20,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT "PK_notification_settings" PRIMARY KEY ("user_id"),
        CONSTRAINT "FK_notification_settings_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "digest_jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "type" character varying(16) NOT NULL CHECK (type IN ('morning','evening','breaking','manual')),
        "status" character varying(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
        "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "finished_at" TIMESTAMP WITH TIME ZONE,
        "error" text,
        CONSTRAINT "PK_digest_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_digest_jobs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "idx_devices_user" ON "devices" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_articles_source_time" ON "articles" ("source_id", "published_at" DESC)`);
        await queryRunner.query(`CREATE INDEX "idx_articles_cluster" ON "articles" ("cluster_id")`);
        await queryRunner.query(`CREATE INDEX "idx_articles_lang_time" ON "articles" ("lang", "published_at" DESC)`);
        await queryRunner.query(`CREATE INDEX "idx_article_topics_topic" ON "article_topics" ("topic_id")`);
        await queryRunner.query(`CREATE INDEX "idx_subscriptions_user" ON "subscriptions" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_interactions_user_time" ON "interactions" ("user_id", "created_at" DESC)`);
        await queryRunner.query(`CREATE INDEX "idx_interactions_article" ON "interactions" ("article_id")`);
        await queryRunner.query(`CREATE INDEX "idx_digest_jobs_status_time" ON "digest_jobs" ("status", "scheduled_at")`);
        await queryRunner.query(`CREATE INDEX "idx_subscriptions_topics" ON "subscriptions" USING gin ("topic_codes")`);
        await queryRunner.query(`CREATE INDEX "idx_subscriptions_sources" ON "subscriptions" USING gin ("source_codes")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "digest_jobs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "read_status"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "bookmarks"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "interactions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "article_topics"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "topics"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "articles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "article_clusters"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sources"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "devices"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "citext"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
exports.InitialMigration1695000000000 = InitialMigration1695000000000;
//# sourceMappingURL=1695000000000-InitialMigration.js.map