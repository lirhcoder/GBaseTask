# Lark 平台 OAuth 配置指南

## 错误 20029 解决方案

### 问题原因
错误 20029 表示 OAuth 请求中的 redirect_uri 与 Lark 平台配置的不匹配。

### 您的当前配置
- **App ID**: cli_a8ad6e051b38d02d  
- **Redirect URI**: `https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback`

## 配置步骤

### 1. 登录 Lark 开发者平台
访问: https://open.larksuite.com

### 2. 进入您的应用
找到 App ID 为 `cli_a8ad6e051b38d02d` 的应用

### 3. 配置 OAuth 重定向 URL

#### 方法 A: 通过应用功能设置
1. 左侧菜单 → **应用功能** (App Features)
2. 找到 **网页应用** (Web App)
3. 点击 **启用网页应用** (Enable Web App)
4. 在 **重定向 URL** (Redirect URLs) 中添加

#### 方法 B: 通过安全设置
1. 左侧菜单 → **安全设置** (Security)
2. 找到 **OAuth 重定向 URL** (OAuth redirect URLs)

### 4. 添加以下 URL（精确复制）

主要 URL:
```
https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback
```

备用 URL（建议同时添加）:
```
https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
```

### 5. 重要注意事项
- ✅ 必须使用 `https` 协议
- ✅ 不要在末尾添加斜杠 `/`
- ✅ 大小写必须完全匹配
- ✅ 不要有任何空格
- ✅ 保存后等待 1-2 分钟生效

## 验证配置

### 检查配置是否正确:
1. 刷新 Lark 平台页面
2. 确认 URL 已保存
3. 检查是否有拼写错误

### 测试 OAuth 登录:
1. 确保服务正在运行
2. 访问: https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html
3. 点击 "使用 Lark 登录"

## 可能的配置位置截图参考

### 英文界面:
- App Features → Web App → Redirect URLs
- Security → OAuth redirect URLs
- Credentials & Basic Info → OAuth 2.0

### 中文界面:
- 应用功能 → 网页应用 → 重定向 URL
- 安全设置 → OAuth 重定向地址
- 凭证与基础信息 → OAuth 2.0

## 如果仍然失败

1. **确认 Cloudflare tunnel URL 没有变化**
   - 运行 `start-with-cloudflare.bat` 查看当前 URL
   - 如果变化了，需要更新 Lark 平台配置

2. **清除浏览器缓存**
   - 使用隐私/无痕模式测试

3. **检查应用状态**
   - 确保应用已发布/已上线
   - 确保网页应用功能已启用

## 调试命令

```bash
# 验证配置
node verify-oauth-config.js

# 查看当前环境变量
node debug-oauth-url.js
```