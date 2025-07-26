@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   智能启动助手
echo ====================================
echo.

cd /d "%~dp0"

node start-helper.js

pause