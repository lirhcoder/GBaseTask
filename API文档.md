# Lark 任务管理系统 API 文档

## 基础信息

- **基础 URL**: `http://localhost:3000`
- **数据格式**: JSON
- **字符编码**: UTF-8

## 接口列表

### 系统接口

#### 健康检查
```
GET /health
```
返回系统健康状态和各服务连接状态。

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "lark": "initialized",
    "sync": "initialized"
  }
}
```

#### API 信息
```
GET /api
```
返回 API 基本信息和可用端点列表。

**响应示例**：
```json
{
  "name": "Lark Task Management System",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "tasks": "/api/tasks",
    "sync": "/api/sync",
    "statistics": "/api/tasks/statistics"
  }
}
```

### 任务接口

#### 获取任务列表
```
GET /api/tasks
```

**查询参数**：
- `status` (string, 可选): 任务状态筛选
  - 可选值: `pending`, `in_progress`, `resolved`, `completed`, `closed`, 等
- `priority` (string, 可选): 优先级筛选
  - 可选值: `urgent`, `high`, `medium`, `low`
- `assignee` (string, 可选): 负责人筛选
- `type` (string, 可选): 任务类型筛选
  - 可选值: `bug`, `requirement`, `task`, `other`
- `page` (number, 可选): 页码，默认 1
- `limit` (number, 可选): 每页数量，默认 20

**响应示例**：
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "[BUG] 登录页面报错",
      "type": "bug",
      "status": "in_progress",
      "priority": "high",
      "assignee": "张三",
      "description": "用户登录时出现500错误",
      "dueDate": "2024-01-10T00:00:00.000Z",
      "tags": ["登录模块", "严重"],
      "sourceId": "rec_xxx",
      "sourceType": "lark_bug",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### 获取任务详情
```
GET /api/tasks/:id
```

**路径参数**：
- `id` (string, 必需): 任务 ID

**响应示例**：
```json
{
  "id": "task_123",
  "title": "[BUG] 登录页面报错",
  "type": "bug",
  "status": "in_progress",
  "priority": "high",
  "assignee": "张三",
  "description": "用户登录时出现500错误",
  "dueDate": "2024-01-10T00:00:00.000Z",
  "tags": ["登录模块", "严重"],
  "sourceId": "rec_xxx",
  "sourceType": "lark_bug",
  "metadata": {
    "reporter": "李四",
    "module": "登录模块",
    "severity": "严重",
    "originalStatus": "处理中",
    "originalPriority": "高"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### 创建任务
```
POST /api/tasks
```

**请求体**：
```json
{
  "title": "新功能开发",
  "type": "task",
  "status": "pending",
  "priority": "medium",
  "assignee": "王五",
  "description": "开发用户管理功能",
  "dueDate": "2024-02-01T00:00:00.000Z",
  "tags": ["新功能", "用户管理"]
}
```

**响应**：返回创建的任务对象

#### 更新任务
```
PUT /api/tasks/:id
```

**路径参数**：
- `id` (string, 必需): 任务 ID

**请求体**：任务对象的部分或全部字段

**响应**：返回更新后的任务对象

#### 更新任务状态
```
PUT /api/tasks/:id/status
```

**路径参数**：
- `id` (string, 必需): 任务 ID

**请求体**：
```json
{
  "status": "completed"
}
```

**响应**：返回更新后的任务对象

#### 删除任务
```
DELETE /api/tasks/:id
```

**路径参数**：
- `id` (string, 必需): 任务 ID

**响应**：
```json
{
  "success": true
}
```

**注意**：只能删除手动创建的任务，不能删除来自 Lark 的任务

#### 获取任务统计
```
GET /api/tasks/statistics
```

**响应示例**：
```json
{
  "byStatus": {
    "pending": 20,
    "in_progress": 15,
    "completed": 50,
    "closed": 30
  },
  "byPriority": {
    "urgent": 5,
    "high": 10,
    "medium": 40,
    "low": 60
  },
  "byType": {
    "bug": 45,
    "requirement": 30,
    "task": 40
  },
  "overdue": 8,
  "topAssignees": [
    { "_id": "张三", "count": 20 },
    { "_id": "李四", "count": 15 }
  ],
  "total": 115
}
```

#### 获取过期任务
```
GET /api/tasks/overdue
```

**响应示例**：
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "[BUG] 紧急修复",
      "dueDate": "2024-01-01T00:00:00.000Z",
      "status": "in_progress",
      "assignee": "张三"
    }
  ],
  "count": 1
}
```

### 同步接口

#### 手动触发全量同步
```
POST /api/sync/manual
```

触发 Bug 和需求的全量同步。

**响应示例**：
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "duration": 1500,
  "success": true,
  "result": {
    "bugs": {
      "synced": 50,
      "errors": 2,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "requirements": {
      "synced": 30,
      "errors": 0,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "total": {
      "synced": 80,
      "errors": 2
    }
  }
}
```

#### 同步 Bug 数据
```
POST /api/sync/bugs
```

仅同步 Bug 数据。

**响应示例**：
```json
{
  "synced": 50,
  "errors": 2,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 同步需求数据
```
POST /api/sync/requirements
```

仅同步需求数据。

**响应示例**：
```json
{
  "synced": 30,
  "errors": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 获取同步状态
```
GET /api/sync/status
```

**响应示例**：
```json
{
  "isRunning": true,
  "lastSync": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "duration": 1500,
    "success": true,
    "result": {
      "total": {
        "synced": 80,
        "errors": 2
      }
    }
  },
  "totalSyncs": 100,
  "successfulSyncs": 98,
  "failedSyncs": 2,
  "averageDuration": 1200
}
```

#### 获取同步历史
```
GET /api/sync/history
```

**查询参数**：
- `limit` (number, 可选): 返回记录数量，默认 10

**响应**：返回同步历史记录数组

#### 更新同步计划
```
PUT /api/sync/schedule
```

**请求体**：
```json
{
  "cronExpression": "0 */15 * * * *"
}
```

**Cron 表达式说明**：
- `0 */30 * * * *`: 每30分钟
- `0 0 * * * *`: 每小时
- `0 0 */2 * * *`: 每2小时
- `0 0 9,18 * * *`: 每天9点和18点

**响应**：
```json
{
  "success": true,
  "message": "同步计划已更新为: 0 */15 * * * *"
}
```

#### 停止同步服务
```
POST /api/sync/stop
```

**响应**：
```json
{
  "success": true,
  "message": "同步服务已停止"
}
```

#### 启动同步服务
```
POST /api/sync/start
```

**请求体**（可选）：
```json
{
  "cronExpression": "0 */30 * * * *"
}
```

**响应**：
```json
{
  "success": true,
  "message": "同步服务已启动",
  "cronExpression": "0 */30 * * * *"
}
```

## 错误响应

所有接口在发生错误时都会返回统一格式的错误响应：

```json
{
  "error": "错误信息描述"
}
```

**HTTP 状态码**：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### 使用 cURL

获取任务列表：
```bash
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=10"
```

创建新任务：
```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "修复登录问题",
    "type": "bug",
    "status": "pending",
    "priority": "high",
    "assignee": "张三",
    "description": "用户无法登录系统"
  }'
```

更新任务状态：
```bash
curl -X PUT "http://localhost:3000/api/tasks/task_123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

触发手动同步：
```bash
curl -X POST "http://localhost:3000/api/sync/manual"
```

### 使用 JavaScript/Axios

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// 获取任务列表
async function getTasks() {
  const response = await axios.get(`${API_BASE}/api/tasks`, {
    params: {
      status: 'pending',
      priority: 'high',
      page: 1,
      limit: 20
    }
  });
  return response.data;
}

// 创建任务
async function createTask(taskData) {
  const response = await axios.post(`${API_BASE}/api/tasks`, taskData);
  return response.data;
}

// 更新任务状态
async function updateTaskStatus(taskId, newStatus) {
  const response = await axios.put(
    `${API_BASE}/api/tasks/${taskId}/status`,
    { status: newStatus }
  );
  return response.data;
}

// 触发同步
async function triggerSync() {
  const response = await axios.post(`${API_BASE}/api/sync/manual`);
  return response.data;
}
```

## 注意事项

1. **数据同步**：系统默认每30分钟自动同步一次 Lark 数据，可通过环境变量 `AUTO_SYNC=false` 禁用自动同步
2. **任务删除**：只能删除手动创建的任务，来自 Lark 的任务不能通过 API 删除
3. **状态映射**：任务状态会在系统状态和 Lark 状态之间自动转换
4. **权限控制**：当前版本未实现身份验证，生产环境需要添加认证机制
5. **并发控制**：同步操作是串行执行的，避免数据冲突