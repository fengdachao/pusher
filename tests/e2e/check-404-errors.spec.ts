import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 8);

test('diagnose 404 errors in browser', async ({ page }) => {
  const networkRequests: any[] = [];
  const errors404: any[] = [];
  
  // 监听所有网络请求
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    networkRequests.push({
      url,
      status,
      method: response.request().method(),
    });
    
    if (status === 404) {
      errors404.push({
        url,
        status,
        method: response.request().method(),
      });
    }
  });

  // 注册并登录
  const email = `test404_${unique()}@example.com`;
  const password = 'password123';

  console.log('\n📝 注册新用户...');
  await page.goto('/register');
  await page.locator('input[type="text"]').first().fill('Test User');
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

  console.log('\n🏠 访问主页...');
  await page.goto('/');
  await page.waitForTimeout(2000);

  console.log('\n📋 访问订阅页面...');
  await page.goto('/subscriptions');
  await page.waitForTimeout(2000);

  console.log('\n⚙️  访问设置页面...');
  await page.goto('/settings');
  await page.waitForTimeout(2000);

  // 输出所有404错误
  console.log('\n' + '='.repeat(70));
  console.log('📊 404 错误分析报告');
  console.log('='.repeat(70));
  
  if (errors404.length === 0) {
    console.log('\n✅ 没有发现404错误！');
  } else {
    console.log(`\n❌ 发现 ${errors404.length} 个404错误:\n`);
    
    errors404.forEach((err, index) => {
      console.log(`${index + 1}. [${err.method}] ${err.url}`);
      
      // 分析错误原因
      if (err.url.includes('/bookmarks')) {
        console.log('   原因: Bookmarks API 未实现');
        console.log('   影响: 低 - 已有错误处理');
      } else if (err.url.includes('/favicon.ico')) {
        console.log('   原因: 缺少网站图标');
        console.log('   影响: 无 - 仅美观问题');
      } else {
        console.log('   原因: 未知，需要检查');
        console.log('   影响: 可能影响功能');
      }
      console.log('');
    });
  }

  // 按类型分组
  const errorsByType = errors404.reduce((acc, err) => {
    const path = new URL(err.url).pathname;
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(errorsByType).length > 0) {
    console.log('📈 404错误统计:');
    Object.entries(errorsByType).forEach(([path, count]) => {
      console.log(`   ${path}: ${count} 次`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 网络请求总计: ${networkRequests.length} 个`);
  console.log(`✅ 成功请求: ${networkRequests.filter(r => r.status >= 200 && r.status < 300).length} 个`);
  console.log(`❌ 404错误: ${errors404.length} 个`);
  console.log(`⚠️  其他错误: ${networkRequests.filter(r => r.status >= 400 && r.status !== 404).length} 个`);
  console.log('='.repeat(70) + '\n');

  // 截图
  await page.screenshot({ path: 'test-results/404-diagnosis.png', fullPage: true });
  console.log('📸 截图已保存: test-results/404-diagnosis.png\n');
});




