# Lark OAuth 错误 20029 解决方案

## 错误信息
- 错误码：20029
- 错误描述：redirect_uri 请求不合法
- Logid: 2025072709191568EFB6C9A78A481721A8

## 问题分析

您的 OAuth 请求使用的 redirect_uri 是：
```
https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback
```

但 Lark 平台报错说这个 URI 不合法，说明平台上的配置与请求不匹配。

## 解决方案

### 方案 1：使用简化的回调路径

1. **更新 .env 文件**：
   ```
   LARK_OAUTH_REDIRECT_URI=https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
   ```

2. **在 Lark 平台配置**：
   ```
   https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
   ```

### 方案 2：在 Lark 平台添加多个 URL

在 Lark 开发者平台同时添加以下所有 URL：

1. `https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback`
2. `https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback/` (带斜杠)
3. `https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback`
4. `https://donor-skirt-anthony-cookie.trycloudflare.com/` (只有域名)

### 方案 3：检查 Lark 平台配置位置

登录 https://open.larksuite.com，检查以下所有位置：

1. **应用功能 (App Features)**
   - 网页应用 (Web App) → 启用网页应用 (Enable Web App)
   - OAuth 重定向 URL (OAuth redirect URLs)

2. **安全设置 (Security)**
   - OAuth 重定向 URL (OAuth redirect URLs)
   - 重定向白名单 (Redirect whitelist)

3. **凭证与基础信息 (Credentials & Basic Info)**
   - OAuth 2.0 设置

### 方案 4：使用本地测试

如果 Cloudflare URL 持续有问题，可以先用本地地址测试：

1. 在 Lark 平台添加：
   ```
   http://localhost:3001/api/auth/oauth/lark/callback
   ```

2. 更新 .env：
   ```
   LARK_OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/oauth/lark/callback
   ```

3. 本地测试 OAuth 流程

## 详细检查步骤

### 1. 确认应用类型
- 确保您的应用是"自建应用"
- 确保应用已经通过审核/已上线

### 2. 检查网页应用设置
1. 进入应用详情
2. 找到"应用功能" → "网页应用"
3. 确保"启用网页应用"已开启
4. 在"重定向 URL"中查看已配置的 URL

### 3. 复制粘贴检查
- 从 Lark 平台复制已配置的 URL
- 与您的请求 URL 逐字符对比
- 注意检查：
  - 协议 (http vs https)
  - 域名拼写
  - 路径大小写
  - 是否有多余的空格或特殊字符

### 4. 等待生效
- 新配置的 URL 可能需要 2-5 分钟生效
- 尝试清除浏览器缓存

## 临时解决方案

如果上述方法都不行，可以：

1. **联系 Lark 支持**
   - 提供 Logid: 2025072709191568EFB6C9A78A481721A8
   - 说明您已经配置了 redirect_uri 但仍然报错

2. **使用 Lark SDK 的内置服务器**
   - 某些 Lark SDK 提供了内置的 OAuth 服务器
   - 可以暂时使用它们的默认回调地址

3. **使用固定域名**
   - 考虑使用付费的 Cloudflare tunnel 获得固定域名
   - 或使用其他固定域名服务

## 调试命令

```bash
# 查看当前配置
node verify-oauth-config.js

# 分析错误
node analyze-oauth-error.js

# 测试回调 URL 可访问性
node test-oauth-redirect.js
```