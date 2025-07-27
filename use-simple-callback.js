// 使用简化的回调路径
require('dotenv').config();
const fs = require('fs');

console.log('=== 切换到简化回调路径 ===\n');

// 读取当前 .env
const envPath = '.env';
let envContent = fs.readFileSync(envPath, 'utf8');

// 更新 redirect URI
const oldUri = 'LARK_OAUTH_REDIRECT_URI=https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback';
const newUri = 'LARK_OAUTH_REDIRECT_URI=https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback';

if (envContent.includes(oldUri)) {
  envContent = envContent.replace(oldUri, newUri);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ 已更新 .env 文件');
  console.log('   新的 redirect_uri:', newUri.split('=')[1]);
} else {
  console.log('⚠️  未找到需要更新的配置');
}

console.log('\n=== 下一步操作 ===\n');
console.log('1. 在 Lark 开发者平台添加以下 URL：');
console.log('   https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback');
console.log();
console.log('2. 重启服务：');
console.log('   npm start');
console.log();
console.log('3. 测试 OAuth 登录：');
console.log('   https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html');
console.log();
console.log('这个简化的路径已经在 src/index-sqlite.js 中配置好了，');
console.log('它会同时处理 OAuth 回调和事件订阅的 challenge 验证。');