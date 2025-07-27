// 调试 OAuth URL 配置
require('dotenv').config();

console.log('=== OAuth URL 调试 ===\n');

// 检查环境变量
console.log('环境变量配置:');
console.log('LARK_OAUTH_REDIRECT_URI:', process.env.LARK_OAUTH_REDIRECT_URI);
console.log();

// 从您提供的 URL 解析
const yourUrl = 'https://accounts.larksuite.com/open-apis/authen/v1/authorize?app_id=cli_a8ad6e051b38d02d&redirect_uri=https%3A%2F%2Fes-lamb-dates-nascar.trycloudflare.com%2Fapi%2Fauth%2Foauth%2Flark%2Fcallback&state=c8017032-c95e-46dc-a555-4ac77362fccf&response_type=code';

console.log('您的授权 URL:');
console.log(yourUrl);
console.log();

// 解析参数
const url = new URL(yourUrl);
console.log('解析的参数:');
console.log('- Base URL:', url.origin + url.pathname);
console.log('- App ID:', url.searchParams.get('app_id'));
console.log('- Redirect URI (编码):', url.searchParams.get('redirect_uri'));
console.log('- Redirect URI (解码):', decodeURIComponent(url.searchParams.get('redirect_uri')));
console.log('- State:', url.searchParams.get('state'));
console.log('- Response Type:', url.searchParams.get('response_type'));
console.log();

// 测试不同的重定向 URI
const testUris = [
  'https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback',
  'https://es-lamb-dates-nascar.trycloudflare.com/lark-callback',
  'https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback/',  // 带斜杠
  'http://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback'     // HTTP
];

console.log('测试不同的重定向 URI 编码:');
testUris.forEach((uri, index) => {
  console.log(`\n${index + 1}. ${uri}`);
  console.log('   编码后:', encodeURIComponent(uri));
});

console.log('\n\n=== 可能的问题 ===\n');
console.log('1. 错误 20029 通常表示 redirect_uri 不匹配');
console.log('2. 请确保在 Lark 平台配置的 URL 与请求的完全一致:');
console.log('   - 协议 (http vs https)');
console.log('   - 域名完全匹配');
console.log('   - 路径完全匹配（包括大小写）');
console.log('   - 末尾斜杠要一致');
console.log();
console.log('3. 如果您在 Lark 平台配置了多个重定向 URI，确保使用的是其中之一');
console.log();
console.log('4. OAuth 授权域名:');
console.log('   - 正确: https://accounts.larksuite.com (您正在使用)');
console.log('   - 错误: https://open.larksuite.com (API 域名)');