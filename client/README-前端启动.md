# 前端启动说明

## 解决乱码问题

如果在 VSCode 中运行批处理文件出现乱码，有以下几种解决方案：

### 方案一：使用英文版批处理（推荐）
```bash
# 双击或在终端运行
start-frontend.bat
```

### 方案二：使用 PowerShell 脚本
```powershell
# 在 PowerShell 中运行
.\启动前端.ps1

# 如果提示权限问题，先执行：
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 方案三：手动启动
```bash
cd client
npm install  # 首次运行
npm run dev
```

### 方案四：修改 VSCode 终端编码
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Terminal: Select Default Profile"
3. 选择 "PowerShell"

或在 VSCode 设置中添加：
```json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "files.encoding": "utf8"
}
```

## 启动步骤

1. **确保后端已启动**
   ```bash
   # 在项目根目录
   node 启动-修复版.js
   ```

2. **启动前端（选择一种方式）**
   
   **推荐：使用英文版批处理**
   ```bash
   cd client
   start-frontend.bat
   ```
   
   **或使用 PowerShell**
   ```powershell
   cd client
   .\启动前端.ps1
   ```

3. **访问前端**
   - 打开浏览器访问: http://localhost:3001

## 常见问题

### Q: 为什么会出现乱码？
A: Windows 批处理文件默认使用 GBK 编码，而 VSCode 默认使用 UTF-8，导致中文显示为乱码。

### Q: PowerShell 脚本无法运行？
A: 需要修改执行策略：
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Q: 依赖安装失败？
A: 尝试使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 端口被占用？
A: 修改 `vite.config.ts` 中的端口配置：
```typescript
server: {
  port: 3002  // 改为其他端口
}
```