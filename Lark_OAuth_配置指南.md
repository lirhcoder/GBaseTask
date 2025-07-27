# Lark OAuth 配置指南

## 概述

本系统现已支持 Lark OAuth 认证，允许用户使用公司 Lark 账号直接登录，无需注册本地账号。

## 配置步骤

### 1. 在 Lark 开发者平台配置应用

1. 访问 [Lark 开发者平台](https://open.larksuite.com)
2. 进入您的应用配置页面
3. 在"安全设置"中添加重定向 URL：

#### 开发环境选项：

**选项 A: 使用 ngrok（推荐）**
```
https://your-subdomain.ngrok.io/api/auth/oauth/lark/callback
```

**选项 B: 使用本地 HTTPS**
```
https://localhost:3001/api/auth/oauth/lark/callback
```

**选项 C: 使用自定义域名**
```
https://lark-dev.local:3001/api/auth/oauth/lark/callback
```

#### 生产环境：
```
https://your-domain.com/api/auth/oauth/lark/callback
```

4. 确保应用具有以下权限：
   - `auth:user.id:readonly` - 获取用户 ID
   - `contact:user.base:readonly` - 获取用户基本信息
   - `bitable:app` - 访问多维表格
   - `bitable:app:readonly` - 读取多维表格
   - `bitable:table:data:read` - 读取表格数据

### 2. 配置环境变量

在 `.env` 文件中添加：

```env
# Lark OAuth 配置
LARK_OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/oauth/lark/callback

# 前端 URL（用于 OAuth 回调后的重定向）
FRONTEND_URL=http://localhost:5173

# 强制使用国际版
LARK_INTERNATIONAL=true
```

### 3. 开发环境 HTTPS 设置

由于 Lark 要求使用 HTTPS 回调 URL，您需要先设置 HTTPS：

#### 方法 1: 使用 ngrok（最简单）

```bash
# 启动本地服务和 ngrok
双击 start-with-ngrok.bat

# 或手动执行：
npm start
ngrok http 3001
```

然后：
1. 复制 ngrok 提供的 HTTPS URL
2. 更新 .env 文件中的 `LARK_OAUTH_REDIRECT_URI`
3. 在 Lark 开发者平台更新回调 URL

#### 方法 2: 本地 HTTPS 证书

```bash
# 创建本地证书
双击 create-local-cert.bat

# 启动 HTTPS 服务器
npm run start:https
```

详细说明请参考 [开发环境HTTPS配置指南.md](./开发环境HTTPS配置指南.md)

### 4. OAuth 登录流程

#### 方式一：使用测试页面

1. 确保 HTTPS 环境已配置
2. 访问测试页面：
   - ngrok: `https://your-subdomain.ngrok.io/test-lark-oauth.html`
   - 本地: `https://localhost:3001/test-lark-oauth.html`
3. 点击"使用 Lark 登录"按钮
4. 在 Lark 授权页面登录并授权
5. 授权成功后自动跳转回应用

#### 方式二：集成到前端应用

1. **获取授权 URL**
   ```javascript
   // GET /api/auth/oauth/lark/authorize
   const response = await fetch('http://localhost:3001/api/auth/oauth/lark/authorize');
   const { authUrl } = await response.json();
   window.location.href = authUrl;
   ```

2. **处理回调**
   - 用户授权后，Lark 会重定向到配置的回调 URL
   - 后端处理授权码，创建/更新用户，生成 JWT token
   - 重定向回前端，URL 中包含 token 参数

3. **保存 Token**
   ```javascript
   // 在前端页面检查 URL 参数
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   const refreshToken = urlParams.get('refreshToken');
   
   if (token) {
     localStorage.setItem('token', token);
     localStorage.setItem('refreshToken', refreshToken);
     // 清理 URL 参数
     window.history.replaceState({}, document.title, window.location.pathname);
   }
   ```

### 4. 用户数据映射

OAuth 登录时，系统会自动：

1. 使用 Lark 用户信息创建本地用户
2. 映射以下字段：
   - `username`: 使用 Lark 的英文名或显示名
   - `email`: Lark 邮箱
   - `displayName`: Lark 显示名
   - `avatar`: Lark 头像
   - `department`: Lark 部门 ID
   - `larkUserId`: Lark 用户 ID（用于关联）

3. 自动生成随机密码（用户不需要使用密码登录）

### 5. Token 管理

系统会保存：
- `larkAccessToken`: 用于访问 Lark API
- `larkRefreshToken`: 用于刷新访问令牌
- `larkTokenExpiry`: 令牌过期时间

当需要访问 Lark 资源时，系统会自动使用用户的 Lark token。

## 测试 OAuth 登录

1. 启动后端服务：
   ```bash
   npm start
   ```

2. 打开测试页面：
   ```bash
   # 直接在浏览器打开
   test-lark-oauth.html
   ```

3. 点击"使用 Lark 登录"按钮进行测试

## 注意事项

1. **开发环境**：确保回调 URL 使用 `localhost` 而不是 `127.0.0.1`
2. **生产环境**：需要更新回调 URL 为生产环境域名
3. **HTTPS**：生产环境建议使用 HTTPS
4. **状态管理**：当前使用内存存储 OAuth state，生产环境应使用 Redis
5. **多租户**：确保应用和多维表格在同一租户下

## 故障排除

### 常见错误

1. **"invalid_redirect_uri"**
   - 检查 Lark 应用中配置的重定向 URL
   - 确保与代码中的 URL 完全一致

2. **"access_denied"**
   - 用户拒绝了授权
   - 检查应用权限配置

3. **"invalid_grant"**
   - 授权码已过期或无效
   - 重新发起授权流程

4. **获取用户信息失败**
   - 检查应用是否有 `contact:user.base:readonly` 权限
   - 确认 token 是否有效

## 优势

使用 OAuth 登录的优势：

1. **无需记住额外密码**：使用公司 Lark 账号即可登录
2. **自动权限同步**：可以基于 Lark 组织架构自动分配权限
3. **单点登录**：已登录 Lark 的用户可以快速授权登录
4. **安全性高**：利用 Lark 的安全机制，支持二次验证等
5. **用户信息同步**：自动获取最新的用户信息