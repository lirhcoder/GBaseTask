# OAuth 登录成功后的使用指南

## 当前状态
✅ OAuth 授权成功
✅ Token 已生成并返回

## 如何使用 Token

### 1. OAuth 登录流程
1. 访问: https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html
2. 点击"使用 Lark 登录"
3. 授权成功后，页面会自动获取并保存 token

### 2. 使用 Token 访问 API

所有需要认证的 API 请求都需要在 Header 中携带 token：

```javascript
// 示例：获取当前用户信息
fetch('http://localhost:3001/api/auth/me', {
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }
})
```

### 3. 测试工具

打开测试工具：http://localhost:3001/test-api-with-token.html

这个工具可以：
- 从本地存储获取 token
- 测试各种 API 端点
- 查看请求和响应详情

### 4. 常用 API 端点

#### 获取用户信息
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

#### 刷新 Token
```
POST /api/auth/refresh
Body: { "refreshToken": "YOUR_REFRESH_TOKEN" }
```

#### 退出登录
```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
```

### 5. Token 存储

OAuth 登录成功后，系统会返回：
- `token` - 访问令牌（用于 API 请求）
- `refreshToken` - 刷新令牌（用于刷新访问令牌）

这些 token 会自动保存在浏览器的 localStorage 中。

### 6. 错误处理

如果看到"请提供认证令牌"错误，说明：
- 没有在请求头中包含 token
- token 格式不正确（需要 "Bearer " 前缀）
- token 已过期

### 7. 在代码中使用

```javascript
// 获取保存的 token
const token = localStorage.getItem('token');

// 使用 token 请求 API
const response = await fetch('http://localhost:3001/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

const userData = await response.json();
console.log('用户信息:', userData);
```

## 下一步

1. 使用测试工具验证 token 是否正常工作
2. 检查用户信息是否正确返回
3. 如果仍有"获取用户信息失败"的问题，查看服务器日志获取详细错误信息