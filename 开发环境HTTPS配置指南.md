# 开发环境 HTTPS 配置指南

Lark OAuth 需要 HTTPS 回调 URL。以下是几种解决方案：

## 方案一：使用 ngrok（推荐）

### 1. 安装 ngrok

访问 [ngrok.com](https://ngrok.com/) 下载并安装。

### 2. 启动本地服务

```bash
npm start
```

### 3. 创建 ngrok 隧道

```bash
ngrok http 3001
```

输出示例：
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

### 4. 配置 Lark 应用

在 Lark 开发者平台添加重定向 URL：
```
https://abc123.ngrok.io/api/auth/oauth/lark/callback
```

### 5. 更新环境变量

```env
# .env
LARK_OAUTH_REDIRECT_URI=https://abc123.ngrok.io/api/auth/oauth/lark/callback
FRONTEND_URL=https://abc123.ngrok.io
```

### 6. 使用 ngrok URL 访问

打开浏览器访问：
```
https://abc123.ngrok.io/test-lark-oauth.html
```

## 方案二：使用 localtunnel

### 1. 安装 localtunnel

```bash
npm install -g localtunnel
```

### 2. 启动隧道

```bash
lt --port 3001 --subdomain lark-task
```

将获得 URL：`https://lark-task.loca.lt`

### 3. 配置步骤同 ngrok

## 方案三：本地 HTTPS 证书

### 1. 安装 mkcert

```bash
# Windows (使用 Chocolatey)
choco install mkcert

# 或从 GitHub 下载
# https://github.com/FiloSottile/mkcert/releases
```

### 2. 创建本地 CA

```bash
mkcert -install
```

### 3. 生成证书

```bash
cd /mnt/c/development/lark-task
mkdir certs
cd certs
mkcert localhost 127.0.0.1
```

### 4. 更新服务器配置

创建 `src/index-https.js`：

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // 将 Express app 导出

const options = {
  key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.pem'))
};

const PORT = process.env.PORT || 3001;

https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS 服务器运行在 https://localhost:${PORT}`);
});
```

### 5. 使用系统 hosts 文件

编辑 hosts 文件添加自定义域名：
```
127.0.0.1 lark-dev.local
```

然后在 Lark 配置：
```
https://lark-dev.local:3001/api/auth/oauth/lark/callback
```

## 方案四：使用 Cloudflare Tunnel

### 1. 安装 cloudflared

从 [Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation) 下载

### 2. 运行隧道

```bash
cloudflared tunnel --url http://localhost:3001
```

## 快速测试方案（开发阶段）

如果只是测试 OAuth 流程，可以：

1. 使用 Postman 或 curl 模拟 OAuth 流程
2. 临时部署到免费云服务（如 Render, Railway）
3. 使用 GitHub Codespaces 或 Gitpod

## 注意事项

1. **ngrok 免费版限制**
   - URL 会在每次重启后改变
   - 有请求数量限制
   - 付费版可获得固定子域名

2. **安全考虑**
   - 这些方案仅用于开发测试
   - 生产环境必须使用真实的 HTTPS 证书

3. **环境变量管理**
   - 使用 `.env.development` 和 `.env.production`
   - 不要提交包含 ngrok URL 的配置

## 推荐开发流程

1. 使用 ngrok 进行日常开发
2. 在 package.json 添加脚本：

```json
{
  "scripts": {
    "dev:tunnel": "npm run start & ngrok http 3001"
  }
}
```

3. 创建配置模板：

```env
# .env.example
LARK_OAUTH_REDIRECT_URI=https://YOUR_NGROK_URL.ngrok.io/api/auth/oauth/lark/callback
```

4. 每次启动时更新 ngrok URL