// 验证 OAuth 配置并测试登录流程
require('dotenv').config();
const LarkOAuthService = require('./src/services/larkOAuth');

console.log('=== OAuth 配置验证 ===\n');

// 检查环境变量
console.log('环境变量:');
console.log('LARK_APP_ID:', process.env.LARK_APP_ID);
console.log('LARK_APP_SECRET:', process.env.LARK_APP_SECRET ? '已设置' : '未设置');
console.log('LARK_OAUTH_REDIRECT_URI:', process.env.LARK_OAUTH_REDIRECT_URI);
console.log('LARK_ENCRYPT_KEY:', process.env.LARK_ENCRYPT_KEY ? '已设置' : '未设置');
console.log();

// 创建 OAuth 服务实例
const oauthService = new LarkOAuthService(
  process.env.LARK_APP_ID,
  process.env.LARK_APP_SECRET
);

// 生成测试授权 URL
const state = oauthService.generateState();
const authUrl = oauthService.getAuthorizationURL(state);

console.log('生成的授权 URL:');
console.log(authUrl);
console.log();

// 解析并验证 URL
const url = new URL(authUrl);
const redirectUri = decodeURIComponent(url.searchParams.get('redirect_uri'));

console.log('URL 分析:');
console.log('- 授权域名:', url.origin);
console.log('- App ID:', url.searchParams.get('app_id'));
console.log('- Redirect URI:', redirectUri);
console.log('- State:', url.searchParams.get('state'));
console.log();

// 验证配置一致性
const configuredUri = process.env.LARK_OAUTH_REDIRECT_URI;
if (redirectUri === configuredUri) {
  console.log('✅ Redirect URI 配置一致');
} else {
  console.log('❌ Redirect URI 配置不一致!');
  console.log('   配置的:', configuredUri);
  console.log('   生成的:', redirectUri);
}

console.log('\n=== Lark 平台配置检查清单 ===\n');
console.log('请在 Lark 开发者平台 (https://open.larksuite.com) 检查:');
console.log();
console.log('1. 应用功能 > 网页应用 > 重定向 URL');
console.log('   必须包含以下 URL (精确匹配):');
console.log('   ' + configuredUri);
console.log();
console.log('2. 确保没有:');
console.log('   - 末尾的斜杠 (/)');
console.log('   - 使用 http 而不是 https');
console.log('   - 大小写错误');
console.log('   - 空格或特殊字符');
console.log();
console.log('3. 如果刚添加或修改，等待 1-2 分钟生效');
console.log();
console.log('4. 可以同时添加备用 URL:');
console.log('   https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback');

console.log('\n=== 测试 OAuth 登录 ===\n');
console.log('1. 重启服务: npm run start-sqlite 或 node src/index-sqlite.js');
console.log('2. 访问测试页面: https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html');
console.log('3. 点击 "使用 Lark 登录" 按钮');
console.log('4. 如果仍然出现 20029 错误，请确认 Lark 平台的配置');