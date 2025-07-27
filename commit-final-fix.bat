@echo off
chcp 65001 >nul
echo ========================================
echo   Commit Final Encoding Fix
echo ========================================
echo.

cd /d C:\development\GBaseTask

echo Committing the final fix...
git add src\index-sqlite.js
git commit -m "完成index-sqlite.js编码修复

- 修复所有剩余的乱码字符
- 修复字符串引号缺失
- 修复emoji位置错误
- 文件现在可以正常运行"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo ========================================
echo   All fixes completed!
echo ========================================
echo.
echo You can now start the server:
echo npm start
echo.
pause