# 解决 Lark 权限错误 20027

## 错误信息
- 错误码：20027
- 错误描述：应用未申请 contact:user.email:readonly 权限
- Logid: 20250727100331D47762EA2E1A841072BE

## 解决方案

### 方案 1：在 Lark 开发者平台添加权限（推荐）

1. **登录 Lark 开发者平台**
   https://open.larksuite.com

2. **进入您的应用**
   App ID: cli_a8ad6e051b38d02d

3. **添加权限**
   - 左侧菜单 → **权限管理** (Permissions)
   - 搜索并添加以下权限：
     - ✅ 获取用户基本信息 (`contact:user.base:readonly`)
     - ✅ 获取用户邮箱地址 (`contact:user.email:readonly`)
     - ✅ 获取用户手机号 (`contact:user.phone:readonly`) - 可选

4. **申请权限**
   - 某些权限可能需要申请审批
   - 填写申请理由（例如："用于用户身份验证和基本信息展示"）
   - 提交申请

5. **等待审批**
   - 基础权限通常立即生效
   - 敏感权限可能需要等待审批

### 方案 2：暂时移除邮箱权限要求（已实施）

我已经更新了代码，暂时只请求基本用户信息权限：
```javascript
scope: 'contact:user.base:readonly'
```

这样可以先让 OAuth 登录正常工作。

### 方案 3：不使用 scope 参数

如果仍有问题，可以完全移除 scope 参数，让 Lark 使用默认权限。

## 测试步骤

1. **重启服务**
   ```bash
   # Ctrl+C 停止，然后重新启动
   npm start
   ```

2. **清除浏览器数据**
   - 清除 Cookie 和本地存储
   - 或使用隐私模式

3. **重新登录**
   访问 OAuth 登录页面重新授权

## 权限说明

### Lark OAuth 权限类型：

1. **基本权限**（通常自动授予）
   - `contact:user.base:readonly` - 用户基本信息
   - 包括：user_id、name、avatar 等

2. **敏感权限**（需要申请）
   - `contact:user.email:readonly` - 用户邮箱
   - `contact:user.phone:readonly` - 用户手机号
   - `contact:user.employee_id:readonly` - 员工号

3. **高级权限**（需要特殊审批）
   - 部门信息、组织架构等

## 临时解决方案

如果权限申请需要时间，可以：

1. **使用模拟邮箱**
   ```javascript
   email: larkUserInfo.email || `${larkUserInfo.user_id}@lark.user`
   ```

2. **只使用必要字段**
   - user_id（必有）
   - name（通常有）
   - avatar_url（可选）

## 长期建议

1. 在 Lark 平台申请所需的所有权限
2. 在应用说明中说明为什么需要这些权限
3. 考虑使用 Lark SDK，它会自动处理权限问题

## 如果问题持续

1. 联系 Lark 技术支持
2. 提供 Logid: 20250727100331D47762EA2E1A841072BE
3. 说明您需要获取用户邮箱用于系统登录