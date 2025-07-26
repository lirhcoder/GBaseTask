@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   启动服务器 - 自定义端口
echo ====================================
echo.
echo 使用方法：
echo   1. 直接双击运行（使用默认端口 3001）
echo   2. 在命令行中运行并指定端口
echo      start-custom-port.bat 3000
echo.

cd /d "%~dp0"

if "%1"=="" (
    echo 使用默认端口 3001
    node start-port.js
) else (
    echo 使用端口 %1
    node start-port.js %1
)

pause