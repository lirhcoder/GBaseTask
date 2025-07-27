# 检查 Lark OAuth 设置

## 错误 20029 解决步骤

### 1. 确认 .env 文件配置

请确保您的 `.env` 文件包含：
```env
LARK_OAUTH_REDIRECT_URI=https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
```

### 2. 在 Lark 开发者平台检查

登录 https://open.larksuite.com，检查您的应用：

#### A. OAuth 重定向 URL 配置位置
- **应用功能** → **网页应用** → **启用网页应用**
- 或 **安全设置** → **重定向 URL**

#### B. 确认配置的 URL
必须**精确匹配**以下 URL（注意每个字符）：
```
https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
```

#### C. 常见错误
- ❌ 末尾多了斜杠 `/`
- ❌ 使用了 http 而不是 https
- ❌ 域名拼写错误
- ❌ 路径大小写不匹配

### 3. 可能需要添加多个 URL

在 Lark 平台可能需要同时添加：
1. `https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback`
2. `https://es-lamb-dates-nascar.trycloudflare.com/lark-callback`

### 4. 检查应用状态

确保：
- ✅ 应用已发布/已上线
- ✅ 网页应用功能已启用
- ✅ 应用有正确的权限范围

### 5. 清除并重新配置

如果还是不行：
1. 在 Lark 平台删除所有重定向 URL
2. 保存
3. 重新添加正确的 URL
4. 再次保存

### 6. 等待生效

有时配置需要几分钟才能生效。

## 调试命令

运行以下命令确认配置：
```bash
# 1. 检查环境变量
node debug-oauth-url.js

# 2. 测试回调 URL 是否正常响应
curl https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback?test=1
```

## 如果仍然失败

尝试使用简化的回调 URL：
1. 在 Lark 平台添加：`https://es-lamb-dates-nascar.trycloudflare.com/lark-callback`
2. 更新 .env：`LARK_OAUTH_REDIRECT_URI=https://es-lamb-dates-nascar.trycloudflare.com/lark-callback`
3. 重启服务