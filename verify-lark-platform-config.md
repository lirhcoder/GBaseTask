# 验证 Lark 平台配置

## 您的 OAuth 请求信息

根据日志，您的系统正在使用：
```
redirect_uri: https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
```

## 在 Lark 开发者平台的配置步骤

### 1. 登录 Lark 开发者平台
访问：https://open.larksuite.com

### 2. 找到 OAuth 配置位置

可能在以下任一位置：

#### 选项 A：应用功能设置
1. 进入您的应用（App ID: cli_a8ad6e051b38d02d）
2. 左侧菜单找到 **"应用功能"** 或 **"App Features"**
3. 找到 **"网页"** 或 **"Web App"**
4. 点击 **"启用网页应用"** 或 **"Enable Web App"**
5. 在 **"重定向 URL"** 或 **"Redirect URLs"** 中添加

#### 选项 B：安全设置
1. 左侧菜单找到 **"安全设置"** 或 **"Security"**
2. 找到 **"OAuth 重定向 URL"** 或 **"OAuth redirect URLs"**

#### 选项 C：凭证与基础信息
1. 在 **"凭证与基础信息"** 或 **"Credentials & Basic Info"**
2. 可能有 **"OAuth 2.0"** 部分

### 3. 添加重定向 URL

在找到的位置，**精确添加**以下 URL：

```
https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
```

⚠️ **注意事项**：
- 不要有空格
- 不要有末尾的斜杠 `/`
- 确保是 `https` 不是 `http`
- 大小写要完全一致

### 4. 可以添加多个 URL

建议同时添加这两个：
1. `https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback`
2. `https://es-lamb-dates-nascar.trycloudflare.com/lark-callback`

### 5. 保存配置

点击保存后，可能需要：
- 等待 1-2 分钟生效
- 刷新页面确认保存成功

## 截图示例位置

### 英文界面可能显示为：
- Redirect URLs
- OAuth redirect URLs  
- Callback URLs
- Web App Settings

### 中文界面可能显示为：
- 重定向 URL
- 回调地址
- OAuth 重定向地址
- 网页应用设置

## 验证配置

配置后，检查是否成功：
1. 刷新 Lark 开发者平台页面
2. 确认 URL 已保存且显示正确
3. 重新测试 OAuth 登录

## 如果找不到配置位置

1. 确保应用类型支持 OAuth（自建应用通常支持）
2. 检查应用是否已发布/上线
3. 可能需要先启用"网页应用"功能

## 调试提示

如果配置正确但仍有问题，可能是：
1. Cloudflare tunnel URL 变化了
2. 配置未生效（等待几分钟）
3. 浏览器缓存（尝试隐私模式）