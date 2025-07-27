@echo off
chcp 65001 >nul
echo ========================================
echo   Fix SyncService Initialization
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Fixing index-sqlite.js...
powershell -Command "(Get-Content src\index-sqlite.js) -replace 'new SyncService\(larkClient, taskSystem\)', 'new SyncService(taskSystem)' | Set-Content src\index-sqlite.js"

echo.
echo Verifying the fix...
findstr /n "new SyncService" src\index-sqlite.js

echo.
echo Committing the fix...
git add src\index-sqlite.js
git commit -m "Fix SyncService initialization in index-sqlite.js - Remove larkClient parameter from SyncService constructor - SyncService only needs taskSystem as parameter - Fixes: this.taskSystem.syncBugsToTasks is not a function"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo ========================================
echo   Fix completed!
echo ========================================
echo.
echo Please restart your backend server:
echo 1. Stop the current server (Ctrl+C)
echo 2. Run: npm run dev
echo.
pause