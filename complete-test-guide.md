# Lark OAuth 完整测试流程

## 前置准备

### 1. 确认环境变量配置
确保 `.env` 文件包含：
```env
LARK_APP_ID=cli_a8ad6e051b38d02d
LARK_APP_SECRET=CuOlnNl2F7BPNQLi9ZLRNDbuKrvwlaaT
LARK_OAUTH_REDIRECT_URI=https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
LARK_ENCRYPT_KEY=sJoVjUwk11X2RHNbnOUqpb
LARK_VERIFICATION_TOKEN=kititgrCMZ7ZXhI2wyO59fnBavJg6MMI
```

### 2. 启动服务
```bash
# 启动后端服务
npm start
```

### 3. 启动 Cloudflare Tunnel
```bash
# 在新的终端窗口
cloudflared tunnel --url http://localhost:3001
```
记下生成的 URL（例如：https://donor-skirt-anthony-cookie.trycloudflare.com）

## 测试步骤

### 步骤 1：更新配置（如果 Cloudflare URL 变化）

如果 Cloudflare URL 发生变化：

1. **更新 .env 文件**
   ```bash
   # 编辑 .env，更新 LARK_OAUTH_REDIRECT_URI
   LARK_OAUTH_REDIRECT_URI=https://新的URL.trycloudflare.com/lark-callback
   ```

2. **重启服务**
   ```bash
   # Ctrl+C 停止服务，然后重新启动
   npm start
   ```

3. **更新 Lark 平台配置**
   - 登录 https://open.larksuite.com
   - 进入您的应用 → 安全设置 → 重定向 URL
   - 添加新的 URL：`https://新的URL.trycloudflare.com/lark-callback`

### 步骤 2：OAuth 登录测试

1. **访问测试页面**
   在浏览器中打开：
   ```
   https://您的cloudflare-url.trycloudflare.com/test-lark-oauth.html
   ```

2. **点击"使用 Lark 登录"按钮**

3. **在 Lark 授权页面**
   - 使用您的 Lark 账号登录
   - 点击"授权"按钮

4. **检查登录结果**
   - 成功：页面会显示"Lark 登录成功！"
   - 失败：查看错误信息

### 步骤 3：验证 Token

1. **使用快速测试工具**
   打开：http://localhost:3001/quick-test.html
   - 页面会自动测试 token
   - 显示用户信息或错误信息

2. **使用浏览器控制台**
   按 F12 打开控制台，运行：
   ```javascript
   // 查看保存的 token
   console.log('Token:', localStorage.getItem('token'));
   
   // 测试 API
   const token = localStorage.getItem('token');
   fetch('http://localhost:3001/api/auth/me', {
       headers: {'Authorization': `Bearer ${token}`}
   }).then(r => r.json()).then(console.log);
   ```

### 步骤 4：测试 API 功能

1. **获取用户信息**
   ```javascript
   // 在控制台运行
   const token = localStorage.getItem('token');
   fetch('http://localhost:3001/api/auth/me', {
       headers: {'Authorization': `Bearer ${token}`}
   }).then(r => r.json()).then(data => {
       console.log('用户信息:', data);
   });
   ```

2. **测试数据同步**（如果实现了相关功能）
   ```javascript
   // 同步 Bug 数据
   fetch('http://localhost:3001/api/sync/bugs', {
       method: 'POST',
       headers: {'Authorization': `Bearer ${token}`}
   }).then(r => r.json()).then(console.log);
   ```

### 步骤 5：故障排查

如果遇到问题：

1. **检查服务器日志**
   查看运行 `npm start` 的终端窗口，寻找：
   - "OAuth 回调 - 使用授权码换取 token"
   - "Token 交换响应"
   - "用户信息 API 响应"

2. **常见错误及解决**

   **错误 20029（redirect_uri 不匹配）**
   - 确保 Lark 平台配置的 URL 与 .env 中完全一致
   - 等待 1-2 分钟让配置生效

   **"获取用户信息失败"**
   - 检查 Lark 平台是否已添加用户信息权限
   - 查看服务器日志中的具体错误

   **"请提供认证令牌"**
   - 确保在请求头中包含 token
   - 格式：`Authorization: Bearer YOUR_TOKEN`

3. **清除并重试**
   ```javascript
   // 在浏览器控制台运行
   localStorage.clear();
   location.reload();
   ```

## 完整测试检查清单

- [ ] 1. Cloudflare tunnel 正在运行
- [ ] 2. 后端服务正在运行（npm start）
- [ ] 3. .env 中的 redirect_uri 与 Cloudflare URL 匹配
- [ ] 4. Lark 平台已配置正确的重定向 URL
- [ ] 5. OAuth 登录成功
- [ ] 6. Token 已保存到 localStorage
- [ ] 7. 使用 token 可以访问 /api/auth/me
- [ ] 8. 返回正确的用户信息

## 测试工具汇总

1. **OAuth 登录页面**
   ```
   https://您的cloudflare-url.trycloudflare.com/test-lark-oauth.html
   ```

2. **快速测试工具**
   ```
   http://localhost:3001/quick-test.html
   ```

3. **API 测试工具**
   ```
   http://localhost:3001/test-api-with-token.html
   ```

4. **命令行测试**
   ```bash
   node test-user-api.js YOUR_TOKEN
   ```

## 成功标志

当您看到以下信息时，表示测试成功：
- OAuth 登录后页面显示"Lark 登录成功！"
- quick-test.html 显示用户信息
- API 返回包含 username、email、displayName 等字段的用户对象