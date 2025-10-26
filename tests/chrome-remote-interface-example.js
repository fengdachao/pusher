/**
 * Chrome Remote Interface 示例
 * 直接使用 Chrome DevTools Protocol
 * 
 * 使用方法:
 * 1. 先启动 Chrome: 
 *    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 * 2. 运行此脚本: node tests/chrome-remote-interface-example.js
 */

const CDP = require('chrome-remote-interface');

async function testChromeRemoteInterface() {
  let client;
  
  try {
    console.log('🔌 连接到 Chrome DevTools Protocol...');
    console.log('📝 确保 Chrome 已用参数启动: --remote-debugging-port=9222');
    
    // 连接到 Chrome
    client = await CDP({ port: 9222 });
    
    const { Network, Page, Runtime, Console } = client;

    console.log('✅ 已连接到 Chrome DevTools Protocol');

    // 启用各种域
    await Promise.all([
      Network.enable(),
      Page.enable(),
      Runtime.enable(),
      Console.enable()
    ]);

    console.log('📊 已启用监控功能');

    // 监听控制台消息
    Console.messageAdded((params) => {
      console.log(`[控制台] ${params.message.level}: ${params.message.text}`);
    });

    // 监听网络请求
    Network.requestWillBeSent((params) => {
      console.log(`➡️  ${params.request.method} ${params.request.url}`);
    });

    Network.responseReceived((params) => {
      console.log(`⬅️  ${params.response.status} ${params.response.url}`);
    });

    // 监听 JavaScript 异常
    Runtime.exceptionThrown((params) => {
      console.error('❌ JS 异常:', params.exceptionDetails);
    });

    console.log('🌐 导航到应用...');
    
    // 导航到页面
    await Page.navigate({ url: 'http://localhost:3000' });
    
    // 等待页面加载
    await Page.loadEventFired();
    
    console.log('✅ 页面加载完成');

    // 执行 JavaScript
    const result = await Runtime.evaluate({
      expression: `({
        title: document.title,
        url: window.location.href,
        userAgent: navigator.userAgent
      })`
    });

    console.log('📄 页面信息:', JSON.stringify(result.result.value, null, 2));

    // 获取性能指标
    const metrics = await Performance.getMetrics();
    console.log('📈 性能指标:', metrics);

    // 截图
    const screenshot = await Page.captureScreenshot({ format: 'png' });
    require('fs').writeFileSync(
      'test-results/chrome-remote-interface-screenshot.png',
      Buffer.from(screenshot.data, 'base64')
    );
    console.log('📸 已保存截图');

    console.log('\n⏳ 保持连接 30 秒以监控活动...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 无法连接到 Chrome!');
      console.log('\n请先启动 Chrome 并开启远程调试:');
      console.log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug');
    } else {
      console.error('❌ 错误:', error);
    }
  } finally {
    if (client) {
      console.log('🔚 关闭连接...');
      await client.close();
    }
  }
}

// 运行测试
testChromeRemoteInterface().catch(console.error);

