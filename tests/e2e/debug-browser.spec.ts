import { test, expect } from '@playwright/test';

test('check browser console errors', async ({ page }) => {
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

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
    if (!response.ok() && response.url().includes('localhost:3001')) {
      networkErrors.push(`[${response.status()}] ${response.url()}`);
    }
  });

  // Navigate to home page
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  
  // Wait a bit for any async operations
  await page.waitForTimeout(3000);

  // Log results
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach(msg => console.log(msg));
  
  console.log('\n=== Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected ✓');
  } else {
    consoleErrors.forEach(err => console.log(err));
  }
  
  console.log('\n=== Network Errors ===');
  if (networkErrors.length === 0) {
    console.log('No network errors detected ✓');
  } else {
    networkErrors.forEach(err => console.log(err));
  }

  // Take a screenshot
  await page.screenshot({ path: 'test-results/homepage-debug.png', fullPage: true });
  
  console.log('\n=== Page URL ===');
  console.log(page.url());
  
  console.log('\n=== Page Title ===');
  console.log(await page.title());
});


