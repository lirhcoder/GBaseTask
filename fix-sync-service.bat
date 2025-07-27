@echo off
chcp 65001 >nul
echo ========================================
echo   Fix SyncService Parameter Issue
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Committing the fix...
git add src/index-sqlite.js
git commit -m "修复SyncService初始化参数错误 - 修正index-sqlite.js中SyncService的参数传递 - SyncService只需要taskSystem一个参数 - 解决this.taskSystem.syncBugsToTasks is not a function错误"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo Fix has been pushed to GitHub!
echo.
echo Now restart the backend server:
echo 1. Stop current server (Ctrl+C)
echo 2. Run: npm run dev
echo.
pause