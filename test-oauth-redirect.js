// 测试 OAuth 重定向 URL 是否正常工作
const axios = require('axios');

const testUrl = 'https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback?test=1';

console.log('测试 OAuth 回调 URL 是否可访问...\n');
console.log('URL:', testUrl);

axios.get(testUrl)
  .then(response => {
    console.log('\n✅ URL 可访问');
    console.log('状态码:', response.status);
    console.log('响应:', JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    if (error.response) {
      console.log('\n⚠️  服务器响应错误');
      console.log('状态码:', error.response.status);
      console.log('响应:', error.response.data);
    } else {
      console.log('\n❌ 无法连接到 URL');
      console.log('错误:', error.message);
    }
  });

console.log('\n如果上面显示 URL 可访问，说明回调地址配置正确。');
console.log('请确保在 Lark 平台配置了完全相同的 URL。');