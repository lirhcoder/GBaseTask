@echo off
chcp 65001 >nul
echo ========================================
echo   Restore index-sqlite.js from Commit
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Restoring from commit 5329bbaab5bb8e2d0c652577ff3e58a936d0852a...
git checkout 5329bbaab5bb8e2d0c652577ff3e58a936d0852a -- src/index-sqlite.js

echo.
echo File restored! Checking syntax...
node --check src\index-sqlite.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Syntax check passed!
    echo.
    echo Committing the restored file...
    git add src\index-sqlite.js
    git commit -m "恢复index-sqlite.js到正常版本 - 从commit 5329bba恢复文件 - 解决编码损坏问题"
    
    echo.
    echo Pushing to GitHub...
    git push origin master
    
    echo.
    echo ========================================
    echo   File successfully restored!
    echo ========================================
    echo.
    echo You can now start the server:
    echo npm start
) else (
    echo ❌ Restored file still has syntax errors
)

echo.
pause