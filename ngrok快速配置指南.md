# ngrok 快速配置指南

## 问题说明

ngrok 现在需要注册账号才能使用。这是一次性配置，完成后即可长期使用。

## 快速配置步骤

### 1. 注册 ngrok 账号（免费）

1. 访问: https://dashboard.ngrok.com/signup
2. 使用邮箱注册（支持 Google/GitHub 快速登录）

### 2. 获取 authtoken

1. 登录后访问: https://dashboard.ngrok.com/get-started/your-authtoken
2. 复制页面上显示的 authtoken（类似: `2fqGH3kL8xYZ9aBcDeFgHiJkLmN_1234567890`）

### 3. 配置 authtoken

打开命令行，运行：
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

例如：
```bash
ngrok config add-authtoken 2fqGH3kL8xYZ9aBcDeFgHiJkLmN_1234567890
```

### 4. 验证配置

运行：
```bash
setup-ngrok.bat
```

如果看到 "ngrok is ready to use!"，说明配置成功。

## 使用方法

配置完成后，即可正常使用：

```bash
# 启动开发环境
双击 start-with-ngrok.bat
```

## 常见问题

### Q: 为什么需要注册？
A: ngrok 更新了政策，所有用户都需要注册账号。免费账号完全满足开发需求。

### Q: authtoken 在哪里？
A: 登录后访问 https://dashboard.ngrok.com/get-started/your-authtoken

### Q: 是否需要付费？
A: 不需要。免费账号支持：
- 1 个在线隧道
- 每分钟 40 次请求
- 随机生成的子域名

### Q: 配置保存在哪里？
A: Windows: `%USERPROFILE%\.ngrok2\ngrok.yml`

## 替代方案

如果不想使用 ngrok，可以考虑：

1. **本地 HTTPS 证书**
   ```bash
   双击 create-local-cert.bat
   npm run start:https
   ```
   但需要在 Lark 配置 `https://localhost:3001` 作为回调地址。

2. **localtunnel**
   ```bash
   npm install -g localtunnel
   lt --port 3001
   ```

3. **临时部署**
   - 使用 Render.com（免费）
   - 使用 Railway.app（有免费额度）

## 提示

- authtoken 只需配置一次
- 不要分享你的 authtoken
- 每次启动 ngrok URL 会变化，需要更新 Lark 配置