# 解决 Windows 批处理文件乱码问题

## 临时解决方案

### 1. 使用英文版本
所有批处理文件都有英文版本：
- `verify-local-code-en.bat` - 英文版验证脚本
- `check-sync-simple.bat` - 简化版检查脚本

### 2. 设置控制台编码
每次打开命令行时运行：
```bash
chcp 65001
```

或运行：
```bash
fix-encoding.bat
```

## 永久解决方案

### 方法 1：修改系统区域设置
1. 打开"控制面板" → "时钟和区域" → "区域"
2. 点击"管理"标签
3. 点击"更改系统区域设置"
4. 勾选"Beta: 使用 Unicode UTF-8 提供全球语言支持"
5. 重启计算机

### 方法 2：使用 PowerShell 替代
PowerShell 默认支持 UTF-8，不会有乱码问题。

### 方法 3：设置命令行自动运行
双击运行 `setup-console-utf8.reg`（需要管理员权限）

## 推荐做法

为了完全避免乱码，建议：

1. **所有批处理文件都使用英文**
2. **在每个批处理文件开头添加**：
   ```batch
   @echo off
   chcp 65001 >nul
   ```

3. **使用 PowerShell 脚本替代批处理**
   PowerShell 脚本（.ps1）天然支持 UTF-8

## 已提供的无乱码脚本

- `verify-local-code-en.bat` - 验证代码（英文）
- `check-sync-simple.bat` - 简单检查（英文）
- `run-test-sync.bat` - 运行测试（已修复）