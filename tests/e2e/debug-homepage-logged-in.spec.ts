import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 8);

test('check homepage after login - browser console', async ({ page }) => {
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  const apiCalls: string[] = [];

  // Listen to console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Listen to page errors
  page.on('pageerror', error => {
    consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });

  // Listen to network responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('localhost:3001')) {
      apiCalls.push(`[${response.status()}] ${url}`);
      if (!response.ok()) {
        networkErrors.push(`[${response.status()}] ${url}`);
      }
    }
  });

  // Register and login
  const email = `debug_${unique()}@example.com`;
  const password = 'password123';

  await page.goto('/register');
  await page.locator('input[type="text"]').first().fill('Debug User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: '注册' }).click();
  
  try {
    await page.waitForURL('**/', { timeout: 5000 });
  } catch {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForTimeout(2000);
  }

  // Navigate to home
  await page.goto('/');
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/homepage-logged-in-debug.png', fullPage: true });

  // Log results
  console.log('\n=== API Calls ===');
  apiCalls.forEach(call => console.log(call));
  
  console.log('\n=== Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('✓ No console errors');
  } else {
    consoleErrors.forEach(err => console.log('✗', err));
  }
  
  console.log('\n=== Network Errors ===');
  if (networkErrors.length === 0) {
    console.log('✓ No network errors');
  } else {
    networkErrors.forEach(err => console.log('✗', err));
  }

  console.log('\n=== Page Info ===');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  // Check for visible elements
  const feedVisible = await page.locator('text=新闻订阅').or(page.locator('text=资讯')).first().isVisible().catch(() => false);
  console.log('Feed visible:', feedVisible);
  
  const articleCount = await page.locator('article, [data-testid="article"]').count();
  console.log('Article count:', articleCount);
});


