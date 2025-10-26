/**
 * Chrome DevTools 网络分析工具
 * 分析应用的网络请求和性能
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeNetwork() {
  console.log('🚀 启动网络分析...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });

  const page = await browser.newPage();

  // 存储网络请求数据
  const requests = [];
  const responses = [];
  const failedRequests = [];

  // 监听所有网络事件
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: Date.now()
    });
  });

  page.on('response', async response => {
    try {
      const request = response.request();
      const responseData = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        size: (await response.buffer()).length,
        timing: response.timing(),
        fromCache: response.fromCache(),
        fromServiceWorker: response.fromServiceWorker(),
        timestamp: Date.now()
      };
      
      responses.push(responseData);

      // 标记失败的请求
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`❌ ${response.status()} ${response.url()}`);
      } else {
        console.log(`✅ ${response.status()} ${response.url()}`);
      }
    } catch (error) {
      console.error('处理响应时出错:', error.message);
    }
  });

  console.log('🌐 访问应用...\n');
  
  try {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('\n✅ 页面加载完成');

    // 等待额外的异步请求
    console.log('⏳ 等待异步请求完成...');
    await page.waitForTimeout(5000);

    // 生成报告
    const report = {
      summary: {
        totalRequests: requests.length,
        totalResponses: responses.length,
        failedRequests: failedRequests.length,
        successRate: ((responses.length - failedRequests.length) / responses.length * 100).toFixed(2) + '%'
      },
      requests: requests,
      responses: responses,
      failedRequests: failedRequests,
      apiCalls: responses.filter(r => r.url.includes('/api/')),
      staticAssets: responses.filter(r => 
        r.url.endsWith('.js') || 
        r.url.endsWith('.css') || 
        r.url.endsWith('.png') || 
        r.url.endsWith('.jpg') || 
        r.url.endsWith('.svg')
      )
    };

    // 保存报告
    const reportPath = 'test-results/network-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 网络分析报告:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`总请求数: ${report.summary.totalRequests}`);
    console.log(`总响应数: ${report.summary.totalResponses}`);
    console.log(`失败请求: ${report.summary.failedRequests}`);
    console.log(`成功率: ${report.summary.successRate}`);
    console.log(`API 调用: ${report.apiCalls.length} 个`);
    console.log(`静态资源: ${report.staticAssets.length} 个`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (failedRequests.length > 0) {
      console.log('\n❌ 失败的请求:');
      failedRequests.forEach(req => {
        console.log(`  ${req.status} ${req.statusText} - ${req.url}`);
      });
    }

    console.log(`\n📄 详细报告已保存到: ${reportPath}`);

    // 性能指标
    const performanceMetrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      const navigation = window.performance.navigation;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: perfData.responseEnd - perfData.fetchStart,
        navigationType: navigation.type,
        redirectCount: navigation.redirectCount
      };
    });

    console.log('\n⚡ 性能指标:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`页面加载时间: ${performanceMetrics.loadTime}ms`);
    console.log(`DOM 就绪时间: ${performanceMetrics.domReady}ms`);
    console.log(`首次绘制: ${performanceMetrics.firstPaint}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n⏳ 浏览器将保持打开 30 秒供您检查...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }

  await browser.close();
  console.log('\n✅ 分析完成！');
}

// 运行分析
analyzeNetwork().catch(console.error);

