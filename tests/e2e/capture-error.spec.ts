import { test } from '@playwright/test';

test('capture detailed browser errors', async ({ page }) => {
  const errors: any[] = [];
  const warnings: any[] = [];
  const networkErrors: any[] = [];
  
  // 捕获所有控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push({ type: 'console.error', text });
      console.log('❌ Console Error:', text);
    } else if (type === 'warning') {
      warnings.push({ type: 'console.warning', text });
      console.log('⚠️  Console Warning:', text);
    }
  });

  // 捕获页面错误
  page.on('pageerror', error => {
    errors.push({ type: 'page.error', text: error.message, stack: error.stack });
    console.log('❌ Page Error:', error.message);
    console.log('Stack:', error.stack);
  });

  // 捕获网络错误
  page.on('response', response => {
    if (!response.ok()) {
      const error = {
        status: response.status(),
        url: response.url(),
        statusText: response.statusText()
      };
      networkErrors.push(error);
      if (response.status() >= 500) {
        console.log('❌ Network Error:', JSON.stringify(error, null, 2));
      }
    }
  });

  // 捕获请求失败
  page.on('requestfailed', request => {
    const error = {
      url: request.url(),
      failure: request.failure()?.errorText
    };
    networkErrors.push(error);
    console.log('❌ Request Failed:', JSON.stringify(error, null, 2));
  });

  console.log('\n🔍 访问主页...\n');
  
  try {
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
  } catch (e: any) {
    console.log('❌ 页面加载失败:', e.message);
  }

  // 等待一下看是否有延迟的错误
  await page.waitForTimeout(3000);

  // 截图
  await page.screenshot({ 
    path: 'test-results/error-capture.png', 
    fullPage: true 
  });

  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 错误总结');
  console.log('='.repeat(70));
  console.log(`❌ 控制台错误: ${errors.filter(e => e.type === 'console.error' || e.type === 'page.error').length} 个`);
  console.log(`⚠️  警告: ${warnings.length} 个`);
  console.log(`🌐 网络错误: ${networkErrors.length} 个`);
  
  if (errors.length === 0 && warnings.length === 0 && networkErrors.filter(e => e.status >= 500).length === 0) {
    console.log('\n✅ 没有发现严重错误！');
    console.log('   (404错误是预期的bookmarks API)');
  } else {
    console.log('\n详细错误信息已在上方显示');
  }
  
  console.log('\n📸 截图保存: test-results/error-capture.png');
  console.log('='.repeat(70) + '\n');
});









