@echo off
chcp 65001 >nul
echo ========================================
echo   Debug Sync Issue
echo ========================================
echo.

cd /d C:\development\lark-task
node debug-sync-issue.js

echo.
pause