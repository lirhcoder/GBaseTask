@echo off
echo ========================================
echo   Lark 任务管理系统 (SQLite 本地版)
echo ========================================
echo.
echo 正在检查依赖...

:: 检查是否需要安装 SQLite 依赖
if not exist node_modules\sqlite3 (
    echo 正在安装 SQLite 依赖...
    npm install sqlite3 sequelize
) else (
    echo SQLite 依赖已安装
)

echo.
echo 正在启动服务器...
echo.

:: 使用 SQLite 版本的配置启动
node src/index-sqlite.js

pause