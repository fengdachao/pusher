-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100),
  lang VARCHAR(8) DEFAULT 'zh',
  region VARCHAR(8),
  timezone VARCHAR(64) DEFAULT 'Asia/Shanghai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(16) NOT NULL CHECK (platform IN ('ios','android','web')),
  push_token TEXT,
  webpush_endpoint TEXT,
  webpush_p256dh TEXT,
  webpush_auth TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(16) NOT NULL CHECK (type IN ('rss','api','list')),
  homepage_url TEXT,
  feed_url TEXT,
  lang VARCHAR(8),
  region VARCHAR(8),
  enabled BOOLEAN DEFAULT TRUE,
  fetch_interval_sec INTEGER DEFAULT 600,
  health_status VARCHAR(32) DEFAULT 'healthy',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article clusters table
CREATE TABLE article_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  simhash BIGINT,
  representative_article_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id),
  cluster_id UUID REFERENCES article_clusters(id),
  url TEXT NOT NULL,
  url_hash CHAR(40) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  lang VARCHAR(8),
  image_url TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  popularity NUMERIC(5,4) DEFAULT 0,
  deleted BOOLEAN DEFAULT FALSE
);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(64) NOT NULL,
  weight INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article topics relationship table
CREATE TABLE article_topics (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  score NUMERIC(5,4) DEFAULT 0,
  PRIMARY KEY(article_id, topic_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  keywords_op VARCHAR(3) DEFAULT 'OR' CHECK (keywords_op IN ('AND','OR')),
  topic_codes TEXT[] DEFAULT '{}',
  source_codes TEXT[] DEFAULT '{}',
  lang_codes TEXT[] DEFAULT '{}',
  region_codes TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 5,
  daily_limit INTEGER DEFAULT 30,
  mute_start TIME,
  mute_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactions table
CREATE TABLE interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  type VARCHAR(16) NOT NULL CHECK (type IN ('click','like','dislike','read','share','open_push')),
  read_time_sec INTEGER,
  channel VARCHAR(16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, article_id)
);

-- Read status table
CREATE TABLE read_status (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, article_id)
);

-- Notification settings table
CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  morning_time TIME DEFAULT '07:30',
  evening_time TIME DEFAULT '19:30',
  channel_email BOOLEAN DEFAULT TRUE,
  channel_push BOOLEAN DEFAULT TRUE,
  channel_webpush BOOLEAN DEFAULT TRUE,
  breaking_enabled BOOLEAN DEFAULT TRUE,
  max_items_per_digest INTEGER DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digest jobs table
CREATE TABLE digest_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(16) NOT NULL CHECK (type IN ('morning','evening','breaking','manual')),
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error TEXT
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE UNIQUE INDEX uq_articles_urlhash ON articles(url_hash);
CREATE INDEX idx_articles_source_time ON articles(source_id, published_at DESC);
CREATE INDEX idx_articles_cluster ON articles(cluster_id);
CREATE INDEX idx_articles_lang_time ON articles(lang, published_at DESC);
CREATE INDEX idx_article_topics_topic ON article_topics(topic_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_interactions_user_time ON interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_article ON interactions(article_id);
CREATE INDEX idx_digest_jobs_status_time ON digest_jobs(status, scheduled_at);

-- GIN indexes for array fields
CREATE INDEX idx_subscriptions_topics ON subscriptions USING GIN (topic_codes);
CREATE INDEX idx_subscriptions_sources ON subscriptions USING GIN (source_codes);