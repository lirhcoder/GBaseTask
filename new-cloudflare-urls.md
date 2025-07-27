# 新的 Cloudflare URL 配置

## 重要：URL 已更新

您的 Cloudflare tunnel URL 已更新为：
```
https://donor-skirt-anthony-cookie.trycloudflare.com
```

## 需要在 Lark 开发者平台更新的 URL

### 1. OAuth 重定向 URL（必须精确匹配）
```
https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback
```

### 2. 备用回调 URL（建议添加）
```
https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
```

### 3. 事件订阅 URL（如果已配置）
```
https://donor-skirt-anthony-cookie.trycloudflare.com/api/auth/oauth/lark/callback
```
或
```
https://donor-skirt-anthony-cookie.trycloudflare.com/lark-callback
```

## 更新步骤

1. 登录 https://open.larksuite.com
2. 进入您的应用（App ID: cli_a8ad6e051b38d02d）
3. 找到 OAuth 配置：
   - 应用功能 → 网页应用 → 重定向 URL
   - 或 安全设置 → OAuth 重定向 URL
4. 删除旧的 URL（包含 es-lamb-dates-nascar）
5. 添加新的 URL（包含 donor-skirt-anthony-cookie）
6. 保存并等待 1-2 分钟生效

## 测试

配置更新后，访问：
https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html

## 注意事项

- Cloudflare 免费 tunnel 的 URL 每次重启都会改变
- 如需固定 URL，考虑使用付费 Cloudflare tunnel 或其他解决方案
- 每次 URL 变化后都需要在 Lark 平台更新配置