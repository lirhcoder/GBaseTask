@echo off
chcp 65001 >nul
echo ========================================
echo   Restore index-sqlite.js from Git
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Checking recent commits with index-sqlite.js...
git log --oneline -10 -- src/index-sqlite.js

echo.
echo Restoring file from a good commit...
REM 从最近一个好的提交恢复文件
git checkout 18c8e2c -- src/index-sqlite.js

echo.
echo File restored! Checking syntax...
node --check src\index-sqlite.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Syntax check passed!
    echo.
    echo Now applying the SyncService fix...
    powershell -Command "(Get-Content src\index-sqlite.js) -replace 'new SyncService\(larkClient, taskSystem\)', 'new SyncService(taskSystem)' | Set-Content src\index-sqlite.js"
    
    echo.
    echo Verifying final file...
    node --check src\index-sqlite.js
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ All fixes applied successfully!
    ) else (
        echo ❌ Error after applying fix
    )
) else (
    echo ❌ Restored file still has errors
)

echo.
pause