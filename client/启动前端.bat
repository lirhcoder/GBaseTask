@echo off
echo ========================================
echo   启动 Lark 任务管理系统前端
echo ========================================
echo.

cd /d "%~dp0"

echo 正在检查前端依赖...
if not exist node_modules (
    echo.
    echo 首次运行，正在安装前端依赖...
    echo 这可能需要 2-3 分钟...
    echo.
    
    call npm install
    
    echo.
    echo 安装 UI 组件库...
    call npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom @tanstack/react-query dayjs
) else (
    echo 依赖已安装
)

echo.
echo ========================================
echo 正在启动前端开发服务器...
echo 前端地址: http://localhost:3001
echo ========================================
echo.

npm run dev

pause