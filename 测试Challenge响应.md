# 测试 Challenge 响应

## 重要提示

**必须先重启服务**，因为我们刚刚更新了路由代码！

```bash
# 停止服务 (Ctrl+C)
# 重新启动
npm start
```

## 测试步骤

### 1. 基础测试端点

首先测试简单的测试端点：
```bash
curl https://2b78283dedc6.ngrok-free.app/test-challenge?challenge=hello123
```

应该返回：
```json
{"challenge":"hello123"}
```

### 2. 测试各个回调路由

#### 主回调路由（GET）:
```bash
curl https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback?challenge=test123
```

#### 主回调路由（POST）:
```bash
curl -X POST https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback \
  -H "Content-Type: application/json" \
  -d "{\"challenge\":\"test123\"}"
```

#### 简化回调路由:
```bash
curl https://2b78283dedc6.ngrok-free.app/lark-callback?challenge=test123
```

## 在 Lark 平台配置

根据测试结果，选择能正常工作的 URL：

### 选项 1（推荐）- 简化路由:
```
https://2b78283dedc6.ngrok-free.app/lark-callback
```

### 选项 2 - 完整路由:
```
https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback
```

## 故障排查

### 如果所有测试都失败：

1. **确认服务已重启**
   ```bash
   # 查看控制台是否有新的启动日志
   ```

2. **检查 ngrok 是否正常**
   - 访问 http://127.0.0.1:4040 查看请求
   - 确认 ngrok 转发到正确的端口 (3001)

3. **查看服务器日志**
   - 每个请求都会在控制台打印详细信息
   - 查看是否有错误信息

### 如果只有 Lark 平台失败：

1. **检查请求方式**
   - Lark 可能使用特殊的 Content-Type
   - 查看服务器日志中的 headers

2. **尝试不同的路径**
   - 使用 `/lark-callback` 而不是完整路径
   - 避免特殊字符和复杂路径

## 最后的备选方案

如果都不行，创建一个最简单的路由：

1. 在 `src/index-sqlite.js` 最顶部添加：
```javascript
app.all('*', (req, res, next) => {
  if (req.query.challenge || req.body.challenge) {
    const challenge = req.query.challenge || req.body.challenge;
    console.log('Challenge detected:', challenge);
    return res.json({ challenge });
  }
  next();
});
```

2. 在 Lark 平台使用任意路径：
```
https://2b78283dedc6.ngrok-free.app/any-path
```

这会拦截所有带 challenge 参数的请求。