# Node.js 降级指南

## 问题说明
您当前使用的 Node.js v22 与 Vite/Rollup 存在兼容性问题。建议降级到 Node.js v18 或 v20 LTS。

## 方案一：使用 nvm-windows（推荐）

### 1. 安装 nvm-windows
下载地址：https://github.com/coreybutler/nvm-windows/releases

选择 `nvm-setup.exe` 下载并安装。

### 2. 使用 nvm 管理 Node.js 版本
```bash
# 查看可用版本
nvm list available

# 安装 Node.js 20 LTS
nvm install 20.18.1

# 切换到 Node.js 20
nvm use 20.18.1

# 验证版本
node -v
```

### 3. 重新安装前端依赖
```bash
cd client
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

## 方案二：直接安装 Node.js 20 LTS

### 1. 卸载当前 Node.js
- 打开"控制面板" > "程序和功能"
- 找到 Node.js，点击卸载

### 2. 下载 Node.js 20 LTS
访问：https://nodejs.org/

选择 20.x LTS 版本下载。

### 3. 安装并验证
安装完成后，打开新的命令行窗口：
```bash
node -v
# 应该显示 v20.x.x
```

### 4. 重新安装项目依赖
```bash
cd C:\development\lark-task\client
npm install
npm run dev
```

## 方案三：使用 pnpm（不需要降级）

pnpm 对新版本 Node.js 的兼容性更好：

```bash
# 安装 pnpm
npm install -g pnpm

# 使用 pnpm 安装依赖
cd client
pnpm install
pnpm dev
```

## 方案四：使用 API 测试页面（无需构建）

如果您只想测试 API 功能，可以直接使用测试页面：

1. 启动后端服务：
   ```bash
   cd C:\development\lark-task
   npm start
   ```

2. 打开浏览器，访问：
   - 文件路径：`C:\development\lark-task\test-api.html`
   - 或在浏览器中直接打开该文件

这个页面包含完整的 API 测试功能，无需安装前端依赖。

## 快速选择建议

- **开发环境**：使用方案一（nvm-windows），方便切换版本
- **生产环境**：使用方案二，安装稳定的 LTS 版本
- **临时测试**：使用方案四，无需处理依赖问题