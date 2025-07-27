// 测试 Lark API 连接
require('dotenv').config();
const axios = require('axios');

async function testLarkAPI() {
  console.log('=== 测试 Lark API ===\n');
  
  // 1. 测试获取 App Access Token
  console.log('1. 测试获取 App Access Token...');
  try {
    const response = await axios.post(
      'https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal',
      {
        app_id: process.env.LARK_APP_ID,
        app_secret: process.env.LARK_APP_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('App Access Token 响应:', {
      code: response.data.code,
      msg: response.data.msg,
      app_access_token: response.data.app_access_token ? '已获取' : '未获取',
      expire: response.data.expire
    });
    
    if (response.data.code === 0) {
      console.log('✅ App Access Token 获取成功\n');
      return response.data.app_access_token;
    } else {
      console.log('❌ App Access Token 获取失败:', response.data.msg);
    }
  } catch (error) {
    console.error('❌ API 调用失败:', error.response?.data || error.message);
  }
  
  return null;
}

// 运行测试
testLarkAPI().then(token => {
  if (token) {
    console.log('\n应用凭证配置正确，API 连接正常。');
    console.log('\n下一步：');
    console.log('1. 检查 Lark 开发者平台的权限配置');
    console.log('2. 确保已添加以下权限：');
    console.log('   - 获取用户基本信息 (contact:user.base:readonly)');
    console.log('   - 获取用户邮箱地址 (contact:user.email:readonly)');
  }
});