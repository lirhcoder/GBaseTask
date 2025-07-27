// 分析 OAuth 错误 20029
const url = 'https://accounts.larksuite.com/open-apis/authen/v1/authorize?app_id=cli_a8ad6e051b38d02d&redirect_uri=https%3A%2F%2Fdonor-skirt-anthony-cookie.trycloudflare.com%2Fapi%2Fauth%2Foauth%2Flark%2Fcallback&state=dd50f056-85b0-44f1-825b-6b946f3c7d9a&response_type=code';

console.log('=== OAuth URL 分析 ===\n');

const parsedUrl = new URL(url);
const redirectUri = decodeURIComponent(parsedUrl.searchParams.get('redirect_uri'));

console.log('您的请求信息:');
console.log('- App ID:', parsedUrl.searchParams.get('app_id'));
console.log('- Redirect URI:', redirectUri);
console.log('- Response Type:', parsedUrl.searchParams.get('response_type'));
console.log();

console.log('=== 可能的原因 ===\n');
console.log('1. Lark 平台上未配置此 redirect_uri');
console.log('2. 配置的 URL 有细微差异（如大小写、斜杠、空格）');
console.log('3. 应用的网页功能未启用');
console.log('4. 配置刚修改，还未生效');
console.log();

console.log('=== 需要检查的 redirect_uri 变体 ===\n');

const variations = [
  redirectUri,
  redirectUri + '/',  // 带斜杠
  redirectUri.replace('https://', 'http://'),  // HTTP
  'https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback',  // 简化路径
  'https://donor-skirt-anthony-cookie.trycloudflare.com',  // 只有域名
];

variations.forEach((uri, index) => {
  console.log(`${index + 1}. ${uri}`);
});

console.log('\n=== 建议的解决步骤 ===\n');
console.log('1. 在 Lark 平台添加所有这些 URL 变体');
console.log('2. 或者使用简化的回调路径 /lark-callback');
console.log('3. 确保应用的"网页应用"功能已启用');
console.log('4. 检查是否有拼写错误');