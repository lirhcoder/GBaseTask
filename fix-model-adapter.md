# 模型适配器修复说明

## 问题
SQLite 版本在运行时，路由仍然尝试加载 MongoDB 的模型，导致登录失败。

## 解决方案
创建了模型适配器，根据运行环境自动选择正确的模型。

### 1. 模型适配器 (`src/utils/model-adapter.js`)
- 自动检测当前运行的版本
- 动态加载对应的模型（SQLite 或 MongoDB）

### 2. 修改的文件
- `src/routes/auth.js` - 使用适配器加载 User 模型
- `src/middleware/auth.js` - 使用适配器加载 User 模型
- `src/routes/users.js` - 使用适配器加载 User 模型

### 3. 工作原理
```javascript
// 自动检测运行版本
const isSQLite = process.argv[1].includes('index-sqlite.js');

// 根据版本加载正确的模型
const { User } = require('../utils/model-adapter');
```

## 测试
现在无论使用哪个版本，登录功能都应该正常工作：
- SQLite 版本：`npm start`
- MongoDB 版本：`npm run start:mongodb`

## 注意事项
- 确保所有使用模型的地方都通过适配器加载
- 新增路由或服务时，应使用模型适配器而不是直接引用模型