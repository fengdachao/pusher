import axios from 'axios';
import { LoginResponse, User, Article, FeedResponse, Source, Topic, Subscription, NotificationSettings } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (email: string, password: string, name?: string): Promise<LoginResponse> =>
    api.post('/auth/register', { email, password, name }).then(res => res.data),
  
  refreshToken: (refreshToken: string): Promise<{ token: string; refreshToken: string }> =>
    api.post('/auth/token/refresh', { refreshToken }).then(res => res.data),
  
  getProfile: (): Promise<User> =>
    api.get('/me').then(res => res.data),
  
  updateProfile: (data: Partial<User>): Promise<User> =>
    api.patch('/me', data).then(res => res.data),
};

export const feedAPI = {
  getFeed: (params?: {
    page?: number;
    limit?: number;
    sort?: 'recency' | 'trend' | 'personal';
    topic?: string;
    source?: string;
    lang?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    diversity?: boolean;
  }): Promise<FeedResponse> =>
    api.get('/feed', { params }).then(res => res.data),
  
  getArticle: (id: string): Promise<Article> =>
    api.get(`/articles/${id}`).then(res => res.data),
  
  getRelatedArticles: (id: string, limit?: number): Promise<Article[]> =>
    api.get(`/articles/${id}/related`, { params: { limit } }).then(res => res.data),
  
  search: (query: string, params?: {
    page?: number;
    limit?: number;
    topic?: string;
    source?: string;
    lang?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'relevance' | 'recency' | 'popularity';
  }): Promise<FeedResponse & { tookMs?: number; totalHits?: number }> =>
    api.get('/search', { params: { q: query, ...params } }).then(res => res.data),
  
  recordInteraction: (articleId: string, type: string, metadata?: any): Promise<void> =>
    api.post('/interactions', { articleId, type, metadata }).then(res => res.data),
  
  // Bookmark operations
  addBookmark: (articleId: string): Promise<void> =>
    api.post('/bookmarks', { articleId }).then(res => res.data),
  
  removeBookmark: (articleId: string): Promise<void> =>
    api.delete(`/bookmarks/${articleId}`).then(res => res.data),
  
  getBookmarks: (params?: { page?: number; limit?: number }): Promise<{
    items: Array<{ articleId: string; article: Article; createdAt: string }>;
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  }> =>
    api.get('/bookmarks', { params }).then(res => res.data),
  
  // Reading status
  markAsRead: (articleId: string): Promise<void> =>
    api.post(`/read/${articleId}`).then(res => res.data),
};

export const sourcesAPI = {
  getSources: (): Promise<Source[]> =>
    api.get('/sources').then(res => res.data),
  
  getTopics: (): Promise<Topic[]> =>
    api.get('/topics').then(res => res.data),
};

export const subscriptionsAPI = {
  getSubscriptions: (): Promise<{ items: Subscription[] }> =>
    api.get('/subscriptions').then(res => res.data),
  
  createSubscription: (data: Partial<Subscription>): Promise<Subscription> =>
    api.post('/subscriptions', data).then(res => res.data),
  
  updateSubscription: (id: string, data: Partial<Subscription>): Promise<Subscription> =>
    api.patch(`/subscriptions/${id}`, data).then(res => res.data),
  
  deleteSubscription: (id: string): Promise<void> =>
    api.delete(`/subscriptions/${id}`).then(res => res.data),
};

export const notificationsAPI = {
  getSettings: (): Promise<NotificationSettings> =>
    api.get('/notification-settings').then(res => res.data),
  
  updateSettings: (data: Partial<NotificationSettings>): Promise<NotificationSettings> =>
    api.patch('/notification-settings', data).then(res => res.data),
  
  triggerDigest: (type?: 'morning' | 'evening' | 'manual'): Promise<{ message: string }> =>
    api.post('/notification-settings/digest/trigger', { type }).then(res => res.data),
  
  getVapidPublicKey: (): Promise<{ publicKey: string }> =>
    api.get('/notification-settings/vapid-public-key').then(res => res.data),
};

export default api;