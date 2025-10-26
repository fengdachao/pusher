/**
 * Chrome DevTools Protocol 示例
 * 使用 Puppeteer 控制 Chrome 浏览器
 */

const puppeteer = require('puppeteer');

async function testChromeDevTools() {
  console.log('🚀 启动 Chrome 浏览器...');
  
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: false, // 显示浏览器界面
    devtools: true,  // 自动打开 DevTools
    args: [
      '--start-maximized',
      '--disable-web-security',
    ]
  });

  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('📊 监听控制台消息...');
  
  // 监听浏览器控制台
  page.on('console', msg => {
    console.log(`[浏览器控制台 ${msg.type()}]:`, msg.text());
  });

  // 监听网络请求
  page.on('request', request => {
    console.log(`➡️  请求: ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    console.log(`⬅️  响应: ${response.status()} ${response.url()}`);
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.error('❌ 页面错误:', error.message);
  });

  console.log('🌐 访问应用...');
  
  try {
    // 访问您的应用
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ 页面加载成功！');

    // 获取页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 执行 JavaScript
    const metrics = await page.evaluate(() => {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        performance: {
          navigation: performance.navigation.type,
          timing: {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
          }
        }
      };
    });

    console.log('📈 性能指标:', JSON.stringify(metrics, null, 2));

    // 截图
    await page.screenshot({ 
      path: 'test-results/chrome-devtools-screenshot.png',
      fullPage: true 
    });
    console.log('📸 已保存截图: test-results/chrome-devtools-screenshot.png');

    // 获取覆盖率
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ]);

    // 等待一段时间让用户手动操作
    console.log('\n⏳ 浏览器将保持打开 30 秒，您可以手动使用 DevTools...');
    console.log('💡 提示: DevTools 已自动打开，您可以查看网络、控制台、性能等标签');
    await page.waitForTimeout(30000);

    // 获取覆盖率结果
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);

    console.log(`\n📊 代码覆盖率:`);
    console.log(`  - JS 文件: ${jsCoverage.length} 个`);
    console.log(`  - CSS 文件: ${cssCoverage.length} 个`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }

  console.log('\n🔚 关闭浏览器...');
  await browser.close();
}

// 运行测试
testChromeDevTools().catch(console.error);

