# Lark OAuth Challenge 验证说明

## 问题描述

当在 Lark 开发者平台配置重定向 URL 时，Lark 会发送一个 challenge 验证请求来确认您控制该 URL。

## 验证流程

1. **Lark 发送验证请求**
   - 请求方式：POST 或 GET
   - 请求参数：`challenge`（随机字符串）
   - 要求：服务器必须返回相同的 challenge 值

2. **服务器响应格式**
   ```json
   {
     "challenge": "收到的challenge值"
   }
   ```

## 已实现的解决方案

在 `src/routes/auth.js` 中，OAuth 回调路由已更新：

```javascript
router.all('/oauth/lark/callback', async (req, res) => {
  try {
    // 合并 query 和 body 参数
    const params = { ...req.query, ...req.body };
    const { code, state, challenge } = params;
    
    // 处理 Lark challenge 验证
    if (challenge) {
      console.log('Lark OAuth challenge 验证:', challenge);
      return res.json({ challenge });
    }
    
    // ... 正常的 OAuth 处理逻辑
  }
});
```

## 配置步骤

1. **启动服务**
   ```bash
   # 使用 ngrok
   双击 start-with-ngrok.bat
   ```

2. **获取 ngrok URL**
   从 ngrok 窗口复制 HTTPS URL，例如：
   ```
   https://2b78283dedc6.ngrok-free.app
   ```

3. **在 Lark 开发者平台配置**
   - 登录 [Lark 开发者平台](https://open.larksuite.com)
   - 进入应用配置 > 安全设置
   - 添加重定向 URL：
     ```
     https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback
     ```
   - 点击保存，Lark 会自动发送 challenge 验证

4. **验证成功**
   如果看到"保存成功"，说明 challenge 验证通过。

## 常见问题

### Q: 仍然提示"Challenge code没有返回"
A: 请检查：
1. 服务是否正常运行
2. ngrok URL 是否正确
3. 路径是否包含 `/api/auth/oauth/lark/callback`

### Q: 404 错误
A: 确保：
1. 后端服务已启动
2. 使用的是正确的路径：`/api/auth/oauth/lark/callback`

### Q: 如何查看 challenge 请求
A: 
1. 查看服务器控制台日志
2. 访问 ngrok Web 界面：http://127.0.0.1:4040

## 测试验证

可以手动测试 challenge 响应：

```bash
# 使用 curl 测试
curl https://your-ngrok-url.ngrok-free.app/api/auth/oauth/lark/callback?challenge=test123

# 应该返回
{"challenge":"test123"}
```

## 注意事项

1. **路由必须支持 GET 和 POST**
   - Lark 可能使用任一方法发送 challenge

2. **响应必须是 JSON 格式**
   - Content-Type: application/json

3. **challenge 值必须原样返回**
   - 不要修改或编码 challenge 值

4. **每次 ngrok 重启 URL 会变化**
   - 需要在 Lark 平台更新重定向 URL