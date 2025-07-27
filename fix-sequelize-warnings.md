# 修复 Sequelize 警告和用户查找失败

## 问题分析

1. **Sequelize 警告**：`Model attributes (larkUserId) passed into finder method options`
   - 原因：SQLite (Sequelize) 需要使用 `where` 子句进行查询
   - MongoDB 直接使用对象查询

2. **用户查找失败**：`用户不存在或未激活`
   - 字段名映射问题（如 `is_active` vs `isActive`）
   - 创建和更新用户的方法不同

## 已实施的修复

### 1. 修复认证中间件字段访问
- 使用 `user.isActive` 而不是 `user.is_active`
- SQLite 模型定义了 getter/setter 来处理字段映射

### 2. 修复用户查询语法
```javascript
// SQLite
User.findOne({ where: { larkUserId: larkUserInfo.user_id } })

// MongoDB
User.findOne({ larkUserId: larkUserInfo.user_id })
```

### 3. 修复用户创建语法
```javascript
// SQLite - 使用 create
user = await User.create(userData);

// MongoDB - 使用 new 和 save
user = new User(userData);
await user.save();
```

### 4. 修复用户更新语法
```javascript
// SQLite - 使用 update
await user.update({ avatar: larkUserInfo.avatar_url });

// MongoDB - 直接修改属性
user.avatar = larkUserInfo.avatar_url;
await user.save();
```

## 测试步骤

1. **清除数据库**（如果需要）
   ```bash
   rm lark-task.db
   ```

2. **重启服务**
   ```bash
   npm start
   ```

3. **重新进行 OAuth 登录**
   - 访问登录页面
   - 完成授权流程

4. **验证修复**
   - 不应再看到 Sequelize 警告
   - 用户应能正常创建和查找
   - API 认证应正常工作

## 关键差异总结

| 功能 | MongoDB | SQLite (Sequelize) |
|------|---------|-------------------|
| 查询 | `User.findOne({field: value})` | `User.findOne({where: {field: value}})` |
| 创建 | `new User(data); await user.save()` | `await User.create(data)` |
| 更新 | `user.field = value; await user.save()` | `await user.update({field: value})` |
| 字段访问 | 直接访问 | 通过 getter/setter |