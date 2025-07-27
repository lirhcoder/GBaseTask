# Lark Encrypt Key 配置说明

## 问题原因

Lark OAuth 回调使用了加密机制，但解密失败。这是因为：

1. **App Secret ≠ Encrypt Key**
2. Lark 使用单独的 **Encrypt Key** 进行数据加密
3. 这个 Encrypt Key 需要在 Lark 开发者平台单独配置

## 解决步骤

### 1. 获取 Encrypt Key

1. 登录 [Lark 开发者平台](https://open.larksuite.com)
2. 进入您的应用
3. 找到以下其中一个位置：
   - **事件订阅** (Event Subscriptions) 设置
   - **安全设置** (Security Settings)
   - **加密配置** (Encryption Configuration)

4. 查找 **Encrypt Key** 或 **Verification Token**

### 2. 配置 Encrypt Key

#### 如果找到 Encrypt Key：

在 `.env` 文件添加：
```env
LARK_ENCRYPT_KEY=你的_Encrypt_Key
```

#### 如果只有 Verification Token：

在 `.env` 文件添加：
```env
LARK_VERIFICATION_TOKEN=你的_Verification_Token
```

### 3. 可能的 Encrypt Key 位置

在 Lark 开发者平台检查：

1. **事件订阅页面**
   - 通常在配置事件订阅时设置
   - 可能标记为 "Encrypt Key" 或 "加密密钥"

2. **应用凭证页面**
   - 可能与 App ID 和 App Secret 在一起
   - 查找 "Verification Token" 或 "校验 Token"

3. **Webhook 配置**
   - 如果配置了 Webhook，可能有单独的加密密钥

### 4. 如果没有找到 Encrypt Key

可能需要：

1. **启用事件订阅**
   - 即使用于 OAuth，也可能需要先启用事件订阅
   - 启用后会生成 Encrypt Key

2. **创建 Verification Token**
   - 在安全设置中可能有生成选项

3. **联系 Lark 支持**
   - 说明您需要 OAuth 回调的加密密钥

## 临时解决方案

如果无法获取 Encrypt Key，可以：

### 方案 A：禁用加密（如果 Lark 支持）

在 Lark 平台查看是否有选项禁用回调加密。

### 方案 B：使用不同的认证流程

1. 使用 JWT 认证而非 OAuth
2. 使用 API Key 认证
3. 使用内部应用模式

## 更新代码

获取 Encrypt Key 后，更新 `larkEncryption.js`：

```javascript
constructor(encryptKey) {
  // 使用 Encrypt Key 而非 App Secret
  this.encryptKey = encryptKey || process.env.LARK_ENCRYPT_KEY || process.env.LARK_VERIFICATION_TOKEN;
  this.aesCipher = new AESCipher(this.encryptKey);
}
```

## 验证步骤

1. 获取 Encrypt Key
2. 更新 .env 文件
3. 重启服务
4. 运行调试脚本：
   ```bash
   node debug-lark-encryption.js
   ```
5. 确认解密成功后再配置 OAuth 回调

## 重要提示

- Encrypt Key 与 App Secret 是不同的
- Encrypt Key 通常是 16 或 32 字符
- 有些应用类型可能不需要加密
- 国际版和中国版的加密方式可能不同