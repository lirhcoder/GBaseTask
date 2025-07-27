# 快速测试检查表

## 1. 启动服务（2个终端窗口）

### 终端 1：启动后端
```bash
cd /mnt/c/development/lark-task
npm start
```

### 终端 2：启动 Cloudflare
```bash
cloudflared tunnel --url http://localhost:3001
```
记录 URL：________________________________

## 2. 更新配置（如果 URL 变化）

- [ ] 更新 .env 中的 `LARK_OAUTH_REDIRECT_URI`
- [ ] 重启后端服务
- [ ] 在 Lark 平台更新重定向 URL

## 3. 测试 OAuth 登录

- [ ] 访问：`https://您的URL/test-lark-oauth.html`
- [ ] 点击"使用 Lark 登录"
- [ ] 完成 Lark 授权
- [ ] 看到"Lark 登录成功！"

## 4. 测试 Token

- [ ] 访问：`http://localhost:3001/quick-test.html`
- [ ] 看到用户信息显示

## 5. 验证成功

在浏览器控制台（F12）运行：
```javascript
// 一行代码测试
fetch('http://localhost:3001/api/auth/me', {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}}).then(r => r.json()).then(console.log);
```

看到用户信息 = 测试成功！ ✅