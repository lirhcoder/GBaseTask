// Lark OAuth 配置调试工具
require('dotenv').config();

console.log('=== Lark OAuth 配置检查 ===\n');

// 1. 检查环境变量
console.log('1. 环境变量配置:');
console.log('   LARK_APP_ID:', process.env.LARK_APP_ID || '❌ 未设置');
console.log('   LARK_APP_SECRET:', process.env.LARK_APP_SECRET ? '✓ 已设置' : '❌ 未设置');
console.log('   LARK_OAUTH_REDIRECT_URI:', process.env.LARK_OAUTH_REDIRECT_URI || '❌ 未设置');
console.log();

// 2. 检查重定向 URI
const redirectUri = process.env.LARK_OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/oauth/lark/callback';
console.log('2. 重定向 URI 分析:');
console.log('   完整 URI:', redirectUri);

try {
  const url = new URL(redirectUri);
  console.log('   协议:', url.protocol);
  console.log('   主机:', url.hostname);
  console.log('   端口:', url.port || '(默认)');
  console.log('   路径:', url.pathname);
} catch (e) {
  console.log('   ❌ 无效的 URL 格式');
}
console.log();

// 3. 生成测试 URL
console.log('3. OAuth 授权 URL:');
const state = 'test-state-123';
const params = new URLSearchParams({
  app_id: process.env.LARK_APP_ID || 'cli_a8ad6e051b38d02d',
  redirect_uri: redirectUri,
  state: state,
  response_type: 'code'
});

const authUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?${params.toString()}`;
console.log('   ', authUrl);
console.log();

// 4. 重要提示
console.log('4. 配置检查清单:');
console.log('   ☐ 在 Lark 开发者平台添加的重定向 URL 必须与上面的完全一致');
console.log('   ☐ 注意 http vs https 的区别');
console.log('   ☐ 注意端口号是否包含');
console.log('   ☐ 注意路径的大小写');
console.log('   ☐ ngrok URL 每次重启会变化');
console.log();

console.log('5. 在 Lark 开发者平台应该配置的重定向 URL:');
console.log('   ', redirectUri);
console.log();

console.log('6. 常见问题:');
console.log('   - 如果使用 ngrok，确保 .env 中的 LARK_OAUTH_REDIRECT_URI 已更新');
console.log('   - 确保 Lark 平台保存的 URL 没有多余的空格');
console.log('   - 某些情况下可能需要等待几分钟让配置生效');
console.log();

// 7. URL 编码测试
console.log('7. URL 编码对比:');
console.log('   原始:', redirectUri);
console.log('   编码:', encodeURIComponent(redirectUri));
console.log();

// 8. 检查是否使用了正确的 Lark 域名
console.log('8. Lark 版本检查:');
const isInternational = process.env.LARK_INTERNATIONAL === 'true' || 
                       (process.env.LARK_APP_ID && process.env.LARK_APP_ID.startsWith('cli_'));
console.log('   使用版本:', isInternational ? '国际版 (larksuite.com)' : '中国版 (feishu.cn)');
console.log('   授权域名:', isInternational ? 'https://open.larksuite.com' : 'https://open.feishu.cn');

// 9. 生成手动测试命令
console.log('\n9. 手动测试 Challenge 验证:');
console.log(`   curl "${redirectUri}?challenge=test123"`);
console.log('   预期响应: {"challenge":"test123"}');