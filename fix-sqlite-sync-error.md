# 修复 SQLite 版本同步功能错误

## 问题
- 错误信息：`TypeError: this.taskSystem.syncBugsToTasks is not a function`
- 原因：SQLite 版本的 TaskSystem 缺少 `syncBugsToTasks` 和 `syncRequirementsToTasks` 方法

## 解决方案

### 1. 添加缺失的同步方法
在 `taskSystem-sqlite.js` 中添加了：
- `syncBugsToTasks()` - 同步 Bug 数据
- `syncRequirementsToTasks()` - 同步需求数据

### 2. 实现细节
- 使用 Lark API 获取多维表格数据
- 解析记录并转换为任务格式
- 根据 larkId 查找现有任务，存在则更新，不存在则创建
- 返回同步统计信息

## 测试步骤

1. **重启服务**
   ```bash
   npm start
   ```

2. **测试同步功能**
   - 点击"同步 Bug 数据"
   - 点击"同步需求数据"
   - 点击"同步所有数据"

## 注意事项

### 需要正确的 Lark 权限
确保 Lark 应用有以下权限：
- 读取多维表格数据
- 获取表格记录

### 环境变量配置
确保 `.env` 文件包含：
```env
LARK_APP_ID=cli_a8ad6e051b38d02d
LARK_APP_SECRET=CuOlnNl2F7BPNQLi9ZLRNDbuKrvwlaaT
LARK_BUG_TABLE_ID=tbl7w5FyrSAa6yW3
LARK_REQUIREMENT_TABLE_ID=tblWSC6MKpoy782J
```

### 可能的后续问题
如果遇到权限错误，需要：
1. 在 Lark 开发者平台添加多维表格相关权限
2. 确保用户有访问指定表格的权限
3. 检查 app token 的获取逻辑