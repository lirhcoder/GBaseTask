@echo off
echo =================================
echo   快速修复同步功能
echo =================================
echo.

echo 1. 停止所有 Node.js 进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. 清理缓存...
del /q node_modules\.cache\* 2>nul
npm cache clean --force 2>nul

echo.
echo 3. 验证文件更新...
echo.
echo 检查 syncBugsToTasks 方法:
findstr /n "syncBugsToTasks" src\services\taskSystem-sqlite.js

echo.
echo 4. 重新启动服务...
echo.
echo 请运行: npm start
echo.
echo =================================
echo   如果还有问题：
echo =================================
echo.
echo 1. 从 GitHub 拉取最新代码:
echo    git pull origin master
echo.
echo 2. 重新安装依赖:
echo    npm install
echo.
echo 3. 直接运行:
echo    node src/index-sqlite.js
echo.
pause