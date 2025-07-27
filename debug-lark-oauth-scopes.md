# Lark OAuth 用户信息获取失败调试

## 问题
OAuth 授权成功，但获取用户信息失败。

## 可能的原因

### 1. 缺少必要的权限范围（Scopes）
Lark OAuth 需要特定的权限才能获取用户信息：
- `contact:user.base:readonly` - 获取用户基本信息
- `contact:user.email:readonly` - 获取用户邮箱
- `contact:user.phone:readonly` - 获取用户手机号（可选）

### 2. API 版本问题
- 当前使用：`/open-apis/authen/v1/user_info`
- 可能需要其他版本或端点

### 3. Access Token 类型问题
- 可能获取到的是 app_access_token 而不是 user_access_token

## 解决方案

### 1. 在 Lark 开发者平台检查权限
1. 登录 https://open.larksuite.com
2. 进入您的应用
3. 找到 **"权限管理"** 或 **"Permissions"**
4. 确保已添加以下权限：
   - 获取用户基本信息
   - 获取用户邮箱地址
   - 获取用户手机号（可选）

### 2. 添加权限范围到授权 URL
需要在授权 URL 中添加 scope 参数。

### 3. 查看详细错误日志
重启服务后，再次尝试登录，查看控制台输出的详细错误信息。

## 测试步骤
1. 重启服务：`npm start`
2. 访问：https://donor-skirt-anthony-cookie.trycloudflare.com/test-lark-oauth.html
3. 点击登录
4. 查看控制台日志

## 备用方案
如果权限问题无法解决，可以考虑：
1. 使用 Lark SDK 而不是直接 API 调用
2. 使用不同的用户信息端点
3. 只保存 user_id，不获取详细信息