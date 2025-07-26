# Lark 国际版配置说明

## 国际版与中国版的区别

### 1. 域名不同
- **国际版（Lark）**: https://www.larksuite.com
- **中国版（飞书）**: https://www.feishu.cn

### 2. API 域名
- **国际版**: https://open.larksuite.com
- **中国版**: https://open.feishu.cn

### 3. 多维表格 URL 格式
- **国际版**: `https://[subdomain].larksuite.com/base/[APP_TOKEN]?table=[TABLE_ID]`
- **中国版**: `https://[subdomain].feishu.cn/base/[APP_TOKEN]?table=[TABLE_ID]`

## 配置步骤

### 1. 获取 App Token

1. 打开您的 Lark 多维表格
2. 查看浏览器地址栏，URL 格式如下：
   ```
   https://your-org.larksuite.com/base/bascnXXXXXXXXXX?table=tblXXXXXXXX
   ```
3. 提取 `base/` 后面的部分（如 `bascnXXXXXXXXXX`）作为 App Token

### 2. 更新 .env 配置

```env
# Lark 应用配置
LARK_APP_ID=cli_a8ad6e051b38d02d
LARK_APP_SECRET=CuOlnNl2F7BPNQLi9ZLRNDbuKrvwlaaT

# 强制使用国际版（可选，系统会自动检测）
LARK_INTERNATIONAL=true

# 多维表格配置
LARK_APP_TOKEN=bascnXXXXXXXXXX  # 从 URL 中提取
LARK_BUG_TABLE_ID=tbl7w5FyrSAa6yW3
LARK_REQUIREMENT_TABLE_ID=tblWSC6MKpoy782J
```

### 3. 应用权限配置

在 Lark 开发者后台（https://open.larksuite.com）配置以下权限：

#### 必需权限
- `bitable:app` - View, comment, and export multidimensional tables
- `bitable:app:readonly` - View multidimensional tables
- `bitable:table:data:read` - Read multidimensional table data
- `bitable:table:data:update` - Update multidimensional table data

#### 可选权限
- `auth:user.id:readonly` - Get user ID
- `contact:user.base:readonly` - Get user basic information

### 4. 运行测试脚本

```bash
node test-lark-auth.js
```

这个脚本会：
- 检查环境变量配置
- 验证 API 连接
- 测试表格访问权限
- 提供详细的错误诊断

## 常见问题

### Q: 401 Unauthorized 错误
**可能原因：**
1. App ID 或 App Secret 错误
2. 未配置 App Token
3. 应用权限不足

**解决方法：**
1. 运行 `node test-lark-auth.js` 诊断问题
2. 检查开发者后台的应用凭证
3. 确保应用有必要的权限

### Q: 如何确认使用的是国际版？
**检查方法：**
1. 查看控制台输出：`初始化 Lark 客户端 - 国际版`
2. App ID 通常以 `cli_` 开头
3. 多维表格 URL 包含 `larksuite.com`

### Q: 多租户/多法人问题
如果您的账号关联多个租户：
1. 确保在正确的租户下创建应用
2. 多维表格和应用必须在同一租户下
3. 检查应用是否被添加到多维表格的协作者

## 调试建议

1. **启用详细日志**
   系统已自动检测并使用正确的域名

2. **使用 API Explorer**
   访问：https://open.larksuite.com/document/server-docs/api-call-guide/api-explorer

3. **检查网络连接**
   确保能访问 `open.larksuite.com`

## 注意事项

1. **自动检测**
   系统会根据 App ID 前缀自动判断版本

2. **手动指定**
   如需强制指定版本，设置环境变量：
   ```env
   LARK_INTERNATIONAL=true  # 国际版
   LARK_INTERNATIONAL=false # 中国版
   ```

3. **数据隐私**
   国际版和中国版的数据是隔离的，不能互通