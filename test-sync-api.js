const axios = require('axios');

// 配置
const API_BASE = 'http://localhost:3000/api';
const TOKEN = process.env.TEST_TOKEN || ''; // 从测试页面获取的token

async function testSyncAPI(token) {
  console.log('========== 测试同步 API ==========\n');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 测试端点
  const endpoints = [
    { method: 'POST', url: '/sync/bugs', name: 'Bug 同步' },
    { method: 'POST', url: '/sync/requirements', name: '需求同步' },
    { method: 'POST', url: '/sync/manual', name: '手动全量同步' },
    { method: 'POST', url: '/sync/all', name: '全部同步' }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n测试 ${endpoint.name} (${endpoint.method} ${endpoint.url}):`);
    console.log('-'.repeat(50));
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE}${endpoint.url}`,
        headers
      });
      
      console.log('✅ 成功!');
      console.log('响应:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ 失败!');
      if (error.response) {
        console.log('状态码:', error.response.status);
        console.log('错误:', error.response.data);
      } else {
        console.log('错误:', error.message);
      }
    }
  }
}

// 主函数
async function main() {
  if (process.argv.length < 3) {
    console.log('使用方法: node test-sync-api.js <token>');
    console.log('\n获取 token 的步骤:');
    console.log('1. 打开 http://localhost:3001/test-lark-oauth.html');
    console.log('2. 点击"使用 Lark 登录"');
    console.log('3. 授权成功后，从页面复制 token');
    console.log('\n示例: node test-sync-api.js eyJhbGciOiJIUzI1NiIs...');
    process.exit(1);
  }

  const token = process.argv[2];
  await testSyncAPI(token);
}

main().catch(console.error);