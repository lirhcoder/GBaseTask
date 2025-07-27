# 解决 ngrok 警告页面问题

## 问题描述

ngrok 免费版在首次访问时会显示一个警告页面 "You are about to visit..."，需要点击 "Visit Site" 才能继续。这导致 Lark 的自动 challenge 验证失败。

## 解决方案

### 方案 1：使用 localtunnel（推荐）

localtunnel 没有警告页面，更适合 OAuth 回调。

#### 安装和使用：

```bash
# 安装 localtunnel
npm install -g localtunnel

# 启动服务
npm start

# 在新窗口启动 localtunnel
lt --port 3001 --subdomain lark-oauth-test
```

您将获得类似这样的 URL：
```
https://lark-oauth-test.loca.lt
```

在 Lark 平台配置：
```
https://lark-oauth-test.loca.lt/api/auth/oauth/lark/callback
```

### 方案 2：使用 Cloudflare Tunnel

1. 下载 cloudflared：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

2. 运行隧道：
```bash
cloudflared tunnel --url http://localhost:3001
```

### 方案 3：部署到免费云平台

#### Render.com（推荐）

1. 将代码推送到 GitHub（已完成）
2. 访问 https://render.com
3. 创建新的 Web Service
4. 连接您的 GitHub 仓库
5. 配置：
   - Build Command: `npm install`
   - Start Command: `npm start`
6. 添加环境变量（从 .env 文件复制）
7. 部署后使用 Render 提供的 URL

#### Railway.app

1. 访问 https://railway.app
2. 从 GitHub 部署
3. 添加环境变量
4. 获得稳定的 HTTPS URL

### 方案 4：配置 ngrok（需要付费）

ngrok 付费版可以：
- 移除警告页面
- 获得固定子域名
- 自定义域名

### 方案 5：临时解决方案

1. 先手动访问一次 ngrok URL
2. 点击 "Visit Site"
3. 然后快速在 Lark 平台保存（有时间限制）

## 最佳实践建议

对于开发环境，推荐使用：

1. **localtunnel** - 无警告页，免费
2. **Cloudflare Tunnel** - 稳定，免费
3. **部署到 Render.com** - 获得永久 URL

## localtunnel 快速开始脚本

创建 `start-with-localtunnel.bat`：

```batch
@echo off
echo Starting with localtunnel...
start cmd /k "npm start"
timeout /t 5
start cmd /k "lt --port 3001 --subdomain lark-oauth"
echo.
echo Localtunnel URL: https://lark-oauth.loca.lt
echo Update this in Lark platform and .env file
pause
```

## 环境变量更新

使用 localtunnel 时更新 .env：
```env
LARK_OAUTH_REDIRECT_URI=https://lark-oauth.loca.lt/api/auth/oauth/lark/callback
```

## 总结

ngrok 免费版的警告页面无法绕过，这是他们的商业模式。建议使用其他免费且无警告页的隧道服务，如 localtunnel 或 Cloudflare Tunnel。