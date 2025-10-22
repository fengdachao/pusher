import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 8);

test('register and login flow', async ({ page }) => {
  const email = `e2e_${unique()}@example.com`;
  const password = 'password123';
  const name = 'E2E User';

  // Go to register
  await page.goto('/register');
  // Fill by input types since labels are not associated via "for"
  await page.locator('input[type="text"]').first().fill(name);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: '注册' }).click();

  // After register, try to navigate to home or login
  try {
    await page.waitForURL('**/', { timeout: 5000 });
  } catch {
    // If not redirected, go to login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: '登录' }).click();
    // Wait for login to complete - check for authenticated content
    await page.waitForTimeout(2000);
  }
  
  // Verify we're logged in by checking for user menu or navigation
  await expect(page.locator('text=我的订阅').or(page.locator('text=订阅管理')).or(page.locator('text=新闻订阅')).first()).toBeVisible({ timeout: 10000 });
});


