# 401 认证错误修复

## 问题分析
OAuth 登录成功，但访问 `/api/auth/me` 返回 401 错误。原因是：
1. SQLite 使用 Sequelize 的 `findByPk` 而不是 MongoDB 的 `findById`
2. 认证中间件使用了错误的方法查找用户

## 已实施的修复

### 1. 创建 SQLite 专用认证中间件
- 文件：`src/middleware/auth-sqlite.js`
- 使用 `User.findByPk()` 替代 `User.findById()`
- 适配 SQLite 的字段名（如 `is_active` 而不是 `isActive`）

### 2. 更新路由使用正确的中间件
- 修改 `src/routes/auth.js`
- 根据运行环境自动选择正确的认证中间件

### 3. 完善 User 模型的 toSafeObject 方法
- 更新字段映射以匹配 SQLite 的下划线命名风格

## 测试步骤

1. **重启服务**
   ```bash
   # Ctrl+C 停止服务
   npm start
   ```

2. **清除浏览器缓存**
   - 使用隐私模式
   - 或清除 localStorage

3. **重新登录**
   - 访问 OAuth 登录页面
   - 完成授权流程

4. **测试 API**
   - 访问 http://localhost:3001/quick-test.html
   - 应该能正确显示用户信息

## 验证修复

在浏览器控制台运行：
```javascript
// 测试认证
const token = localStorage.getItem('token');
fetch('http://localhost:3001/api/auth/me', {
    headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(console.log);
```

成功响应应包含：
- user 对象
- username、email、displayName 等字段