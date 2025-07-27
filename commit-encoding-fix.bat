@echo off
chcp 65001 >nul
echo ========================================
echo   Commit Encoding Fix
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Checking file syntax...
node --check src\index-sqlite.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Syntax error found! Please fix before committing.
    pause
    exit /b 1
)

echo ✅ Syntax check passed!
echo.

echo Committing fixes...
git add src\index-sqlite.js
git commit -m "修复index-sqlite.js文件编码损坏问题

- 修复所有中文字符乱码
- 修复字符串引号缺失问题
- 确保文件可以正常运行"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo ========================================
echo   Fix completed successfully!
echo ========================================
echo.
echo Now you can start the server:
echo npm start
echo.
pause