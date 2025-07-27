const axios = require('axios');

// 从命令行参数获取 token
const token = process.argv[2];

if (!token) {
    console.log('使用方法: node test-user-api.js YOUR_TOKEN');
    console.log('\n获取 token 的方法:');
    console.log('1. 通过 OAuth 登录后，在浏览器控制台运行:');
    console.log('   console.log(localStorage.getItem("token"))');
    console.log('2. 复制输出的 token');
    console.log('3. 运行: node test-user-api.js 复制的token');
    process.exit(1);
}

const API_BASE = 'http://localhost:3001';

async function testUserAPI() {
    console.log('=== 测试用户 API ===\n');
    console.log('使用的 token:', token.substring(0, 20) + '...');
    
    try {
        console.log('\n1. 测试 GET /api/auth/me...');
        const response = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ 成功！');
        console.log('状态码:', response.status);
        console.log('用户信息:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ 请求失败!');
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('错误信息:', error.response.data);
            
            if (error.response.status === 401) {
                console.log('\n可能的原因:');
                console.log('- Token 已过期');
                console.log('- Token 格式不正确');
                console.log('- 需要重新登录获取新 token');
            }
        } else {
            console.error('网络错误:', error.message);
        }
    }
}

// 测试其他 API
async function testOtherAPIs() {
    console.log('\n\n2. 测试其他 API...');
    
    // 测试验证 token
    try {
        const verifyResponse = await axios.post(`${API_BASE}/api/auth/verify`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('\n✅ Token 验证成功:', verifyResponse.data);
    } catch (error) {
        console.error('\n❌ Token 验证失败:', error.response?.data || error.message);
    }
}

// 运行测试
async function runTests() {
    await testUserAPI();
    await testOtherAPIs();
    
    console.log('\n\n=== 测试完成 ===');
    console.log('\n如果看到"获取用户信息失败"，请检查:');
    console.log('1. 服务器日志中的详细错误信息');
    console.log('2. Lark 开发者平台是否已添加用户信息权限');
    console.log('3. 重新登录获取新的 token');
}

runTests();