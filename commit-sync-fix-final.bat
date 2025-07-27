@echo off
chcp 65001 >nul
echo ========================================
echo   Commit SyncService Fix
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Committing the SyncService fix...
git add src\index-sqlite.js
git commit -m "修复SyncService初始化参数问题

- 移除多余的larkClient参数
- SyncService只需要taskSystem参数
- 解决this.taskSystem.syncBugsToTasks is not a function错误"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo ========================================
echo   Fix completed successfully!
echo ========================================
echo.
echo Server is now ready to start:
echo npm start
echo.
pause