# SQLite 版本路由修复说明

## 问题
SQLite 版本缺少认证和其他必要的路由，导致登录时出现 404 错误。

## 解决方案
已将所有必要的路由和服务添加到 SQLite 版本：

1. **认证路由** (`/api/auth`)
   - POST /api/auth/register - 用户注册
   - POST /api/auth/login - 用户登录
   - GET /api/auth/me - 获取当前用户

2. **任务路由** (`/api/tasks`)
   - GET /api/tasks - 获取任务列表
   - POST /api/tasks - 创建任务
   - PUT /api/tasks/:id - 更新任务
   - DELETE /api/tasks/:id - 删除任务

3. **同步路由** (`/api/sync`)
   - POST /api/sync/manual - 手动同步
   - POST /api/sync/bugs - 同步 Bug 数据
   - POST /api/sync/requirements - 同步需求数据
   - GET /api/sync/status - 获取同步状态
   - GET /api/sync/history - 获取同步历史

4. **用户管理路由** (`/api/users`)
   - GET /api/users - 获取用户列表
   - PUT /api/users/:id - 更新用户
   - DELETE /api/users/:id - 删除用户

## 测试
重新启动服务器后，登录功能应该正常工作：
```bash
npm start
```

然后打开测试页面进行登录测试。