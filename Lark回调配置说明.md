# Lark 回调配置说明

## 事件配置 vs 回调配置

### 1. OAuth 回调配置（重定向 URL）
- **用途**：OAuth 2.0 授权流程的回调
- **触发时机**：用户授权登录时
- **路径**：通常是 `/api/auth/oauth/lark/callback`
- **功能**：处理授权码，交换 token，创建用户会话

### 2. 事件订阅配置
- **用途**：接收 Lark 的各种事件通知
- **触发时机**：
  - 用户加入/离开群组
  - 消息事件
  - 审批事件
  - 文档变更等
- **路径**：可以相同，但建议使用不同路径如 `/api/events/lark`
- **功能**：处理各种业务事件

## 使用相同 URL 的影响

### 没有问题的情况：
1. 如果您的代码能正确区分请求类型
2. OAuth 请求有 `code` 和 `state` 参数
3. 事件请求有 `event` 或特定的事件结构

### 可能的问题：
1. **日志混乱**：OAuth 和事件日志混在一起
2. **性能影响**：所有请求都经过同一个处理逻辑
3. **维护困难**：代码逻辑会变复杂

## 建议的最佳实践

### 1. 使用不同的路径（推荐）

```javascript
// OAuth 回调
app.all('/api/auth/oauth/lark/callback', handleOAuthCallback);

// 事件订阅
app.post('/api/events/lark', handleEvents);
```

### 2. 如果必须使用相同路径

更新您的回调处理逻辑：

```javascript
app.all('/lark-callback', (req, res) => {
  const params = { ...req.query, ...req.body };
  
  // 1. 处理 challenge 验证
  if (params.encrypt) {
    const decrypted = decrypt(params.encrypt);
    if (decrypted.challenge) {
      return res.json({ challenge: decrypted.challenge });
    }
  }
  
  // 2. 处理 OAuth 回调
  if (params.code && params.state) {
    return handleOAuthCallback(req, res);
  }
  
  // 3. 处理事件通知
  if (params.event || params.type === 'event_callback') {
    return handleEventCallback(req, res);
  }
  
  // 4. 未知请求
  res.status(400).json({ error: 'Unknown callback type' });
});
```

### 3. 创建事件处理器

如果您需要处理事件，创建 `src/routes/events.js`：

```javascript
const express = require('express');
const router = express.Router();
const LarkEncryption = require('../services/larkEncryption');

router.post('/lark', async (req, res) => {
  try {
    const { encrypt } = req.body;
    
    if (encrypt) {
      const encryption = new LarkEncryption();
      const decrypted = encryption.decrypt(encrypt);
      
      // Challenge 验证
      if (decrypted.challenge) {
        return res.json({ challenge: decrypted.challenge });
      }
      
      // 事件处理
      if (decrypted.event) {
        await handleEvent(decrypted.event);
        return res.json({ success: true });
      }
    }
    
    res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('事件处理失败:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

async function handleEvent(event) {
  console.log('收到 Lark 事件:', event.type);
  
  switch (event.type) {
    case 'user.created':
      // 处理用户创建事件
      break;
    case 'message.receive':
      // 处理消息接收事件
      break;
    // 添加更多事件处理
  }
}

module.exports = router;
```

## 当前状态

您的配置已经成功：
- ✅ OAuth 回调验证通过
- ✅ 加密解密正常工作
- ✅ Challenge 响应正确

## 下一步

1. **测试 OAuth 登录**
   访问：`https://es-lamb-dates-nascar.trycloudflare.com/test-lark-oauth.html`

2. **如果需要事件订阅**
   - 考虑使用不同的路径
   - 或者增强现有路由的判断逻辑

3. **监控日志**
   - 查看是否有意外的请求
   - 确保 OAuth 和事件请求都被正确处理