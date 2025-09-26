export interface User {
  id: string;
  email: string;
  name?: string;
  lang: string;
  region?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  userId: string;
  token: string;
  refreshToken: string;
}

export interface Source {
  id: string;
  code: string;
  name: string;
  type: 'rss' | 'api' | 'list';
  homepageUrl?: string;
  feedUrl?: string;
  lang?: string;
  region?: string;
  enabled: boolean;
}

export interface Topic {
  id: string;
  code: string;
  name: string;
  weight: number;
}

export interface Article {
  id: string;
  title: string;
  summary?: string;
  url: string;
  sourceId: string;
  sourceName: string;
  lang?: string;
  topics: string[];
  publishedAt: string;
  popularity: number;
  imageUrl?: string;
  read?: boolean;
  bookmarked?: boolean;
}

export interface FeedResponse {
  items: Article[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  keywords: string[];
  keywordsOp: 'AND' | 'OR';
  topicCodes: string[];
  sourceCodes: string[];
  langCodes: string[];
  regionCodes: string[];
  priority: number;
  dailyLimit: number;
  muteStart?: string;
  muteEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  morningTime: string;
  eveningTime: string;
  channelEmail: boolean;
  channelPush: boolean;
  channelWebpush: boolean;
  breakingEnabled: boolean;
  maxItemsPerDigest: number;
}