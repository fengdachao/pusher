import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface DigestArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    };

    this.transporter = nodemailer.createTransporter(emailConfig);
  }

  /**
   * Send digest email to user
   */
  async sendDigest(
    userEmail: string,
    articles: DigestArticle[],
    digestType: 'morning' | 'evening' | 'breaking' = 'morning'
  ): Promise<void> {
    try {
      const template = this.generateDigestTemplate(articles, digestType);
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      this.logger.log(`Sent ${digestType} digest to ${userEmail} with ${articles.length} articles`);
    } catch (error) {
      this.logger.error(`Failed to send digest to ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send breaking news notification
   */
  async sendBreakingNews(
    userEmail: string,
    article: DigestArticle
  ): Promise<void> {
    try {
      const template = this.generateBreakingNewsTemplate(article);
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      this.logger.log(`Sent breaking news to ${userEmail}: ${article.title}`);
    } catch (error) {
      this.logger.error(`Failed to send breaking news to ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Generate digest email template
   */
  private generateDigestTemplate(
    articles: DigestArticle[],
    digestType: string
  ): EmailTemplate {
    const timeGreeting = digestType === 'morning' ? '早上好' : '晚上好';
    const typeLabel = digestType === 'morning' ? '晨报' : '晚报';
    
    const subject = `📰 今日${typeLabel} - ${articles.length} 条精选资讯`;

    const articlesHtml = articles.map((article, index) => `
      <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          ${article.imageUrl ? `
            <img src="${article.imageUrl}" alt="" style="width: 120px; height: 80px; object-fit: cover; border-radius: 6px; flex-shrink: 0;">
          ` : ''}
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; line-height: 1.4; color: #111827;">
              <a href="${article.url}" style="color: #111827; text-decoration: none;" target="_blank">
                ${article.title}
              </a>
            </h3>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
              ${article.summary}
            </p>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: #9ca3af;">
              <span>${article.source}</span>
              <span>•</span>
              <span>${this.formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">📰 新闻订阅</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">${timeGreeting}！为您精选${articles.length}条资讯</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          ${articlesHtml}
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            您收到此邮件是因为订阅了个性化新闻推送
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
            <a href="#" style="color: #9ca3af; text-decoration: none;">管理订阅</a> |
            <a href="#" style="color: #9ca3af; text-decoration: none;">退订</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
${timeGreeting}！

今日${typeLabel} - ${articles.length} 条精选资讯

${articles.map((article, index) => `
${index + 1}. ${article.title}
${article.summary}
来源：${article.source} | ${this.formatDate(article.publishedAt)}
链接：${article.url}
`).join('\n')}

---
新闻订阅系统
    `.trim();

    return { subject, html, text };
  }

  /**
   * Generate breaking news template
   */
  private generateBreakingNewsTemplate(article: DigestArticle): EmailTemplate {
    const subject = `🚨 突发新闻：${article.title}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🚨 突发新闻</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">重要资讯推送</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <div style="border: 2px solid #fecaca; border-radius: 8px; padding: 20px; background: #fef2f2;">
            ${article.imageUrl ? `
              <img src="${article.imageUrl}" alt="" style="width: 100%; max-width: 500px; height: auto; object-fit: cover; border-radius: 6px; margin-bottom: 16px;">
            ` : ''}
            <h2 style="margin: 0 0 12px 0; font-size: 20px; line-height: 1.4; color: #111827;">
              ${article.title}
            </h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
              ${article.summary}
            </p>
            <div style="text-align: center;">
              <a href="${article.url}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;" target="_blank">
                查看详情
              </a>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fecaca; font-size: 14px; color: #6b7280; text-align: center;">
              来源：${article.source} | ${this.formatDate(article.publishedAt)}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            您收到此邮件是因为订阅了突发新闻推送
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
🚨 突发新闻

${article.title}

${article.summary}

来源：${article.source}
时间：${this.formatDate(article.publishedAt)}
链接：${article.url}

---
新闻订阅系统
    `.trim();

    return { subject, html, text };
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed:', error);
      return false;
    }
  }
}