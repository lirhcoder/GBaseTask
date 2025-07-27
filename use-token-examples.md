# 使用 Token 访问 API 的方法

## 方法 1：使用测试页面（最简单）

1. **获取 Token**
   - 先通过 OAuth 登录：https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html
   - 登录成功后，token 会自动保存

2. **使用测试工具**
   - 打开：http://localhost:3001/test-api-with-token.html
   - 点击"从本地存储获取 Token"
   - 点击"测试 GET /api/auth/me"

## 方法 2：使用浏览器控制台

打开浏览器控制台（F12），执行以下代码：

```javascript
// 获取保存的 token
const token = localStorage.getItem('token');

// 请求用户信息
fetch('http://localhost:3001/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => console.log('用户信息:', data))
.catch(error => console.error('错误:', error));
```

## 方法 3：使用 cURL（命令行）

首先获取 token（从浏览器控制台）：
```javascript
console.log(localStorage.getItem('token'));
```

然后使用 cURL：
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 方法 4：使用 Postman

1. 打开 Postman
2. 创建新请求：
   - Method: GET
   - URL: http://localhost:3001/api/auth/me
3. 在 Headers 标签页添加：
   - Key: Authorization
   - Value: Bearer YOUR_TOKEN_HERE

## 方法 5：创建简单的测试脚本

创建 `test-user-api.js`：

```javascript
const axios = require('axios');

// 从命令行参数获取 token
const token = process.argv[2];

if (!token) {
    console.log('请提供 token: node test-user-api.js YOUR_TOKEN');
    process.exit(1);
}

async function testUserAPI() {
    try {
        const response = await axios.get('http://localhost:3001/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('用户信息:', response.data);
    } catch (error) {
        console.error('错误:', error.response?.data || error.message);
    }
}

testUserAPI();
```

运行：
```bash
node test-user-api.js YOUR_TOKEN_HERE
```

## 故障排除

如果仍然看到"获取用户信息失败"：

1. **检查服务器日志**
   查看控制台输出，特别是：
   - "Token 交换响应"
   - "用户信息 API 响应"

2. **验证权限**
   确保 Lark 平台已添加：
   - 获取用户基本信息
   - 获取用户邮箱地址

3. **检查 token 是否有效**
   在浏览器控制台运行：
   ```javascript
   // 解码 token 查看内容（仅用于调试）
   const token = localStorage.getItem('token');
   if (token) {
       const parts = token.split('.');
       const payload = JSON.parse(atob(parts[1]));
       console.log('Token 内容:', payload);
   }
   ```