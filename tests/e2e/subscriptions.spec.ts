import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 8);

test('create and delete subscription', async ({ page }) => {
  const email = `sub_${unique()}@example.com`;
  const password = 'password123';
  const name = 'E2E 订阅 ' + unique();

  // Register
  await page.goto('/register');
  await page.locator('input[type="text"]').first().fill('E2E User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: '注册' }).click();
  
  // After register, try to navigate to home or login
  try {
    await page.waitForURL('**/', { timeout: 5000 });
  } catch {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForTimeout(2000);
  }

  // Go to subscriptions
  await page.goto('/subscriptions');

  // Open create modal
  await page.getByRole('button', { name: '新建订阅' }).click();
  
  // Wait for modal to appear by checking for the modal heading
  await expect(page.getByRole('heading', { name: '新建订阅' })).toBeVisible();

  // Fill form - find inputs within the modal by their position
  const modal = page.locator('form');
  const textInputs = modal.locator('input[type="text"]');
  
  // Name (first text input)
  await textInputs.nth(0).fill(name);
  // Keywords (second text input with placeholder)
  await textInputs.nth(1).fill('AI, 人工智能');
  // Topic codes (third text input)
  await textInputs.nth(2).fill('tech, ai');
  // Source codes (fourth text input)
  await textInputs.nth(3).fill('techcrunch');
  
  // Submit the form
  await page.getByRole('button', { name: '创建' }).click();

  // Wait for success message and modal to close
  await page.waitForTimeout(1000);
  
  // Assert subscription appears in the list
  await expect(page.getByText(name)).toBeVisible();

  // Find and delete the subscription - the trash icon button
  // Set up dialog handler before clicking
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('确定要删除这个订阅吗');
    await dialog.accept();
  });
  
  // Click the delete button (second button in the actions, after edit)
  await page.locator(`text=${name}`).locator('..').locator('..').getByRole('button').nth(1).click();
  
  // Wait for deletion
  await page.waitForTimeout(1000);
  
  // Assert subscription is removed
  await expect(page.getByText(name)).not.toBeVisible();
});


